# — Learning Management System

A full-stack LMS with role-based access for students, instructors, and admins. Built with real-time communication, AI-powered features, and a clean modern UI.

## Tech Stack

**Frontend:** React, Redux Toolkit, Tailwind CSS, Vite  
**Backend:** Node.js, Express, PostgreSQL, Socket.io  
**AI:** Groq (LLaMA 3.3 70B)

## Features

### Authentication
- JWT authentication with httpOnly cookies
- Google OAuth integration
- Role-based access control (student, instructor, admin)
- Password strength validation and email domain verification

### Course Management
- Course builder with modules and lessons
- Drag-and-drop module reordering
- Video embedding with duration tracking
- Course publishing and draft management
- Category and level filtering
- Course search by title, description, or instructor name

### AI Features
- **AI Quiz Generator** — generates multiple choice questions from a topic using LLaMA 3.3
- **AI Course Assistant** — students can ask questions about lesson content in real time
- **AI Assignment Feedback** — instructors get AI-generated grade suggestions and detailed feedback on student submissions

### Quizzes & Assignments
- AI-generated quizzes with auto-grading
- Assignment submission and manual grading with feedback
- Grade notifications for students

### Real-Time Communication
- Course chat rooms with Socket.io
- Direct messaging between users
- Message deletion and chat clearing
- Unread message indicators

### Notifications
- Real-time bell notifications via Socket.io
- Triggered on: new submission, assignment graded, direct message, course announcement
- Mark as read / mark all as read / delete

### Student Features
- Course enrollment and progress tracking
- Progress bars on enrolled course cards
- Course wishlist
- Upcoming assignments dashboard
- Recent activity feed
- AI course assistant on every lesson

### Instructor Features
- Course builder with lesson, quiz, and assignment management
- Student list per course with progress and messaging
- Submission grading with AI feedback
- Course announcements (notifies all enrolled students)
- Course chat access

### Admin Features
- User management (view, edit roles, delete)
- Course management
- Category management

### Reviews
- Star ratings and written reviews
- Average rating displayed on course cards and detail pages

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL

### Backend Setup
```bash
cd Backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

### Database Setup
```bash
psql -U postgres -d lms_db -f migrations/001_users.sql
psql -U postgres -d lms_db -f migrations/002_categories.sql
psql -U postgres -d lms_db -f migrations/003_courses.sql
psql -U postgres -d lms_db -f migrations/004_modules.sql
psql -U postgres -d lms_db -f migrations/005_lessons.sql
psql -U postgres -d lms_db -f migrations/006_enrollments.sql
psql -U postgres -d lms_db -f migrations/007_progress.sql
psql -U postgres -d lms_db -f migrations/008_quizzes.sql
psql -U postgres -d lms_db -f migrations/009_assignments.sql
psql -U postgres -d lms_db -f migrations/010_submissions.sql
psql -U postgres -d lms_db -f migrations/011_seed.sql
psql -U postgres -d lms_db -f migrations/012_reviews.sql
psql -U postgres -d lms_db -f migrations/013_messages.sql
psql -U postgres -d lms_db -f migrations/014_notifications.sql
psql -U postgres -d lms_db -f migrations/015_wishlist.sql
psql -U postgres -d lms_db -f migrations/016_announcements.sql
```

## Roles

- **Student** — browse and enroll in courses, take AI-generated quizzes, submit assignments, use AI course assistant, leave reviews, wishlist courses, chat with instructors
- **Instructor** — create and manage courses, grade submissions with AI feedback, post announcements, chat with students, view enrolled student list
- **Admin** — manage users, courses, and categories