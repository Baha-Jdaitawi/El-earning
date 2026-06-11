import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { testConnection } from './config/db.js';
import { findUserByGoogleId, findUserByEmail, createUser, updateUser, updateLastLogin, findUserById } from './models/userModel.js';
import { createMessage, deleteMessage, clearCourseChat } from './models/messageModel.js';
import { isEnrolled } from './models/enrollmentModel.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  skip: () => process.env.NODE_ENV === 'development',
}));

// Middleware
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport
app.use(passport.initialize());

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await findUserByGoogleId(profile.id);
      if (user) {
        await updateLastLogin(user.id);
        return done(null, user);
      }

      user = await findUserByEmail(profile.emails[0].value);
      if (user) {
        await updateUser(user.id, {
          google_id: profile.id,
          avatar: user.avatar || profile.photos[0]?.value,
        });
        await updateLastLogin(user.id);
        return done(null, user);
      }

      const newUser = await createUser({
        name: profile.displayName,
        email: profile.emails[0].value,
        google_id: profile.id,
        avatar: profile.photos[0]?.value,
        role: 'student',
      });

      await updateLastLogin(newUser.id);
      return done(null, newUser);
    } catch (err) {
      return done(err, null);
    }
  }));
}

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || '';
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    if (!tokenMatch) return next(new Error('Authentication required'));
    const token = tokenMatch[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id);
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  const user = socket.user;
  console.log(`Socket connected: ${user.name} (${user.role})`);

  // Join course chat room
  socket.on('join_course', async (course_id) => {
    try {
      if (user.role === 'student') {
        const enrolled = await isEnrolled(user.id, parseInt(course_id));
        if (!enrolled) return;
      }
      socket.join(`course_${course_id}`);
      console.log(`${user.name} joined course_${course_id}`);
    } catch (err) {
      console.error(err);
    }
  });

  // Leave course chat room
  socket.on('leave_course', (course_id) => {
    socket.leave(`course_${course_id}`);
  });

  // Send course message
  socket.on('send_course_message', async ({ course_id, content }) => {
    try {
      if (!content?.trim()) return;

      if (user.role === 'student') {
        const enrolled = await isEnrolled(user.id, parseInt(course_id));
        if (!enrolled) return;
      }

      const message = await createMessage({
        sender_id: user.id,
        course_id: parseInt(course_id),
        content: content.trim(),
      });

      const fullMessage = {
        ...message,
        sender_name: user.name,
        sender_avatar: user.avatar,
        sender_role: user.role,
      };

      io.to(`course_${course_id}`).emit('new_course_message', fullMessage);
    } catch (err) {
      console.error(err);
    }
  });

  // Join direct message room
  socket.on('join_direct', (other_user_id) => {
    const roomId = [user.id, parseInt(other_user_id)].sort().join('_');
    socket.join(`direct_${roomId}`);
  });

  // Send direct message
  socket.on('send_direct_message', async ({ receiver_id, content }) => {
    try {
      if (!content?.trim()) return;

      const message = await createMessage({
        sender_id: user.id,
        receiver_id: parseInt(receiver_id),
        content: content.trim(),
      });

      const fullMessage = {
        ...message,
        sender_name: user.name,
        sender_avatar: user.avatar,
        sender_role: user.role,
      };

      const roomId = [user.id, parseInt(receiver_id)].sort().join('_');
      io.to(`direct_${roomId}`).emit('new_direct_message', fullMessage);
    } catch (err) {
      console.error(err);
    }
  });

  // Delete message
  socket.on('delete_message', async ({ message_id, course_id, receiver_id }) => {
    try {
      await deleteMessage(message_id);
      if (course_id) {
        io.to(`course_${course_id}`).emit('message_deleted', message_id);
      } else if (receiver_id) {
        const roomId = [user.id, parseInt(receiver_id)].sort().join('_');
        io.to(`direct_${roomId}`).emit('message_deleted', message_id);
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Clear course chat
  socket.on('clear_course_chat', async (course_id) => {
    try {
      if (user.role !== 'instructor' && user.role !== 'admin') return;
      await clearCourseChat(parseInt(course_id));
      io.to(`course_${course_id}`).emit('chat_cleared');
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${user.name}`);
  });
});

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', env: process.env.NODE_ENV });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, message });
});

const PORT = process.env.PORT || 3003;

const start = async () => {
  const connected = await testConnection();
  if (!connected) {
    console.error('Failed to connect to database. Exiting.');
    process.exit(1);
  }
  httpServer.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Enabled' : 'Disabled'}`);
    console.log(` Socket.io: Enabled`);
  });
};

start();

export default app;