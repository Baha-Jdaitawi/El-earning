import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyEnrollments } from '../../../store/slices/enrollmentSlice.js';
import { getProgressStatsApi, getRecentActivityApi } from '../api/dashboardApi.js';
import { getUpcomingAssignmentsApi } from '../../assignments/api/assignmentsApi.js';
import StatsCard from '../components/StatsCard.jsx';
import RecentActivity from '../components/RecentActivity.jsx';
import CourseCard from '../../courses/components/CourseCard.jsx';

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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here's an overview of your learning progress.</p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Enrolled Courses"
            value={stats?.total_enrolled || 0}
            accent="bg-indigo-50 text-indigo-600"
            icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" /></svg>}
          />
          <StatsCard
            label="Completed Courses"
            value={stats?.total_completed || 0}
            accent="bg-emerald-50 text-emerald-600"
            icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} /><path d="m8 12 2.5 2.5L16 9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>}
          />
          <StatsCard
            label="Lessons Completed"
            value={stats?.lessons_completed || 0}
            accent="bg-teal-50 text-teal-600"
            icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} /><path d="M10 8.5v7l5.5-3.5L10 8.5Z" fill="currentColor" /></svg>}
          />
          <StatsCard
            label="Time Spent"
            value={formatTime(stats?.total_time_spent)}
            accent="bg-amber-50 text-amber-600"
            icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>}
          />
        </section>

        {/* My Courses */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
            <Link to="/courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.slice(0, 6).map((e) => (
                <CourseCard key={e.id} course={{
                  id: e.course_id,
                  title: e.title,
                  thumbnail: e.thumbnail,
                  level: e.level,
                  category_name: e.category_name,
                  instructor_name: e.instructor_name,
                  enrolled_students: 0,
                  price: 0,
                }} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              You haven't enrolled in any courses yet.
            </p>
          )}
        </section>

        {/* Recent Activity + Upcoming Assignments */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
            <RecentActivity activities={recentActivity} />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              {upcomingAssignments.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {upcomingAssignments.map((a) => {
                    const soon = isDueSoon(a.due_date);
                    return (
                      <li key={a.id} className="flex items-start gap-3 p-4">
                        <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${soon ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {soon ? <WarningIcon /> : <CalendarIcon />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{a.title}</p>
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
                <p className="p-8 text-center text-sm text-gray-500">No upcoming assignments.</p>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;