import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyEnrollments } from '../../../store/slices/enrollmentSlice.js';
import { getProgressStatsApi, getRecentActivityApi } from '../api/dashboardApi.js';
import { getUpcomingAssignmentsApi } from '../../assignments/api/assignmentsApi.js';
import StatsCard from '../components/StatsCard.jsx';
import RecentActivity from '../components/RecentActivity.jsx';
import EnrolledCourseCard from '../components/EnrolledCourseCard.jsx';

const CalendarIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <rect x={3.5} y={5} width={17} height={16} rx={2} stroke="currentColor" strokeWidth={1.8} />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const WarningIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path d="M12 4 2.5 20h19L12 4Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
    <path d="M12 10v4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
    <circle cx={12} cy={17} r={1} fill="currentColor" />
  </svg>
);

const formatTime = (seconds) => {
  if (!seconds) return '0h';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const isDueSoon = (dueDate) => {
  if (!dueDate) return false;
  const diff = new Date(dueDate) - new Date();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
};

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { enrollments } = useSelector((state) => state.enrollment);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);

  useEffect(() => {
    dispatch(fetchMyEnrollments());
    getProgressStatsApi().then((res) => setStats(res.data.data)).catch(() => {});
    getRecentActivityApi(5).then((res) => setRecentActivity(res.data.data)).catch(() => {});
    getUpcomingAssignmentsApi(5).then((res) => setUpcomingAssignments(res.data.data)).catch(() => {});
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">Here&#x2019;s an overview of your learning progress.</p>
          </div>
          <Link
            to="/courses"
            className="flex-shrink-0 self-start rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Browse Courses
          </Link>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:p-5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" /></svg>
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight text-gray-900 sm:text-2xl">{stats?.total_enrolled || 0}</p>
              <p className="truncate text-xs text-gray-500">Enrolled</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:p-5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} /><path d="m8 12 2.5 2.5L16 9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight text-gray-900 sm:text-2xl">{stats?.total_completed || 0}</p>
              <p className="truncate text-xs text-gray-500">Completed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:p-5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} /><path d="M10 8.5v7l5.5-3.5L10 8.5Z" fill="currentColor" /></svg>
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight text-gray-900 sm:text-2xl">{stats?.lessons_completed || 0}</p>
              <p className="truncate text-xs text-gray-500">Lessons</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:p-5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight text-gray-900 sm:text-2xl">{formatTime(stats?.total_time_spent)}</p>
              <p className="truncate text-xs text-gray-500">Time Spent</p>
            </div>
          </div>
        </section>

        {/* My Courses */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">My Courses</h2>
            {enrollments.length > 6 && (
              <Link to="/my-courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View all ({enrollments.length})
              </Link>
            )}
          </div>
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.slice(0, 6).map((e) => (
                <EnrolledCourseCard key={e.id} enrollment={e} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              You haven&#x2019;t enrolled in any courses yet.{' '}
              <Link to="/courses" className="font-medium text-indigo-600 hover:text-indigo-700">Browse courses</Link>
            </p>
          )}
        </section>

        {/* Recent Activity + Upcoming Assignments */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

          <section>
            <h2 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Recent Activity</h2>
            <RecentActivity activities={recentActivity} />
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Upcoming Assignments</h2>
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              {upcomingAssignments.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {upcomingAssignments.map((a) => {
                    const soon = isDueSoon(a.due_date);
                    return (
                      <li key={a.id} className="flex items-start gap-3 p-3 sm:p-4">
                        <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${soon ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {soon ? <WarningIcon /> : <CalendarIcon />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{a.title}</p>
                          <p className="truncate text-xs text-gray-500">{a.course_title}</p>
                        </div>
                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${soon ? 'bg-rose-100 text-rose-700' : 'text-gray-500'}`}>
                          {new Date(a.due_date).toLocaleDateString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="p-6 text-center text-sm text-gray-500">No upcoming assignments.</p>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;