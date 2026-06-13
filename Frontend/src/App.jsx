import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice.js';
import { initSocket, disconnectSocket } from './lib/socket.js';
import Navbar from './shared/components/Navbar.jsx';
import Sidebar from './shared/components/Sidebar.jsx';
import ProtectedRoute from './shared/components/ProtectedRoute.jsx';
import NotFoundPage from './shared/components/NotFoundPage.jsx';

import LoginPage from './features/auth/pages/LoginPage.jsx';
import RegisterPage from './features/auth/pages/RegisterPage.jsx';
import ProfilePage from './features/auth/pages/ProfilePage.jsx';

import CoursesPage from './features/courses/pages/CoursesPage.jsx';
import CourseDetailPage from './features/courses/pages/CourseDetailPage.jsx';
import CreateCoursePage from './features/courses/pages/CreateCoursePage.jsx';
import EditCoursePage from './features/courses/pages/EditCoursePage.jsx';

import StudentDashboard from './features/dashboard/pages/StudentDashboard.jsx';
import InstructorDashboard from './features/dashboard/pages/InstructorDashboard.jsx';
import AdminDashboard from './features/dashboard/pages/AdminDashboard.jsx';
import AdminUsersPage from './features/dashboard/pages/AdminUsersPage.jsx';
import AdminCategoriesPage from './features/dashboard/pages/AdminCategoriesPage.jsx';
import InstructorSubmissionsPage from './features/dashboard/pages/InstructorSubmissionsPage.jsx';
import StudentProgressPage from './features/dashboard/pages/StudentProgressPage.jsx';
import CourseStudentsPage from './features/dashboard/pages/CourseStudentsPage.jsx';

import LessonPage from './features/lessons/pages/LessonPage.jsx';
import AssignmentsPage from './features/assignments/pages/AssignmentsPage.jsx';
import CourseBuilderPage from './features/courses/pages/CourseBuilderPage.jsx';

import CourseChatPage from './features/chat/pages/CourseChatPage.jsx';
import DirectChatPage from './features/chat/pages/DirectChatPage.jsx';
import InboxPage from './features/chat/pages/InboxPage.jsx';

import WishlistPage from './features/wishlist/pages/WishlistPage.jsx';

const PublicLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <Outlet />
  </div>
);

const StudentLayout = () => (
  <ProtectedRoute roles={['student']}>
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  </ProtectedRoute>
);

const InstructorLayout = () => (
  <ProtectedRoute roles={['instructor', 'admin']}>
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  </ProtectedRoute>
);

const AdminLayout = () => (
  <ProtectedRoute roles={['admin']}>
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  </ProtectedRoute>
);

const AuthLayout = () => (
  <ProtectedRoute roles={['student', 'instructor', 'admin']}>
    <Outlet />
  </ProtectedRoute>
);

const App = () => {
  const dispatch = useDispatch();
  const { loading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, []);

  useEffect(() => {
    if (user) {
      initSocket();
    } else {
      disconnectSocket();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Student */}
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/my-courses" element={<CoursesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/progress" element={<StudentProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/messages" element={<InboxPage />} />
          <Route path="/messages/:userId" element={<DirectChatPage />} />
          <Route path="/learn/:courseId/chat" element={<CourseChatPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Route>

        {/* Lesson fullscreen */}
        <Route element={<AuthLayout />}>
          <Route path="/learn/:courseId/lesson/:lessonId" element={<LessonPage />} />
        </Route>

        {/* Instructor */}
        <Route element={<InstructorLayout />}>
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/courses" element={<CoursesPage />} />
          <Route path="/instructor/courses/:id/builder" element={<CourseBuilderPage />} />
          <Route path="/instructor/courses/create" element={<CreateCoursePage />} />
          <Route path="/instructor/courses/:id/edit" element={<EditCoursePage />} />
          <Route path="/instructor/submissions" element={<InstructorSubmissionsPage />} />
          <Route path="/instructor/profile" element={<ProfilePage />} />
          <Route path="/instructor/messages" element={<InboxPage />} />
          <Route path="/instructor/messages/:userId" element={<DirectChatPage />} />
          <Route path="/instructor/courses/:courseId/chat" element={<CourseChatPage />} />
          <Route path="/instructor/courses/:courseId/students" element={<CourseStudentsPage />} />
        </Route>

        {/* Admin */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/courses" element={<CoursesPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
          <Route path="/admin/messages" element={<InboxPage />} />
          <Route path="/admin/messages/:userId" element={<DirectChatPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;