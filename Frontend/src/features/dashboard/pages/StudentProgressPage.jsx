import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getLearningStatsApi, getRecentActivityApi } from '../api/dashboardApi.js';
import { getMyEnrollmentsApi } from '../../enrollment/api/enrollmentApi.js';
import StatsCard from '../components/StatsCard.jsx';
import RecentActivity from '../components/RecentActivity.jsx';

const formatTime = (seconds) => {
  if (!seconds) return '0h';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const CheckCircleIcon = ({ className }) => (
  <svg className={className || 'h-4 w-4'} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="m8 12 2.5 2.5L16 9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProgressBar = ({ progress }) => {
  const value = Math.max(0, Math.min(100, progress));
  const isComplete = value === 100;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-indigo-600'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

const CourseProgressCard = ({ enrollment }) => {
  const isComplete = parseFloat(enrollment.progress) >= 100;
  return (
    <li className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      {enrollment.thumbnail ? (
        <img src={enrollment.thumbnail} alt={enrollment.title} className="h-16 w-24 flex-shrink-0 rounded-lg object-cover" />
      ) : (
        <span className="flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-semibold text-indigo-700">
          {enrollment.title?.slice(0, 2).toUpperCase()}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900">{enrollment.title}</h3>
            <p className="mt-0.5 truncate text-sm text-gray-500">{enrollment.instructor_name}</p>
          </div>
          {isComplete && (
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <CheckCircleIcon className="h-3 w-3" /> Completed
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ProgressBar progress={parseFloat(enrollment.progress) || 0} />
          <span className={`flex-shrink-0 text-sm font-semibold ${isComplete ? 'text-emerald-600' : 'text-indigo-600'}`}>
            {Math.round(parseFloat(enrollment.progress) || 0)}%
          </span>
        </div>
      </div>
    </li>
  );
};

const StudentProgressPage = () => {
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    getLearningStatsApi().then((res) => setStats(res.data.data)).catch(() => {});
    getMyEnrollmentsApi().then((res) => setEnrollments(res.data.data || [])).catch(() => {});
    getRecentActivityApi(10).then((res) => setRecentActivity(res.data.data || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">My Progress</h1>
          <p className="mt-1 text-sm text-gray-500">Track your learning journey across all your courses.</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Total Enrolled"
            value={stats?.total_enrolled || 0}
            accent="bg-indigo-50 text-indigo-600"
            icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" /></svg>}
          />
          <StatsCard
            label="Completed"
            value={stats?.total_completed || 0}
            accent="bg-emerald-50 text-emerald-600"
            icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" /><path d="M10 13.5h4M9 20h6M12 16v4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>}
          />
          <StatsCard
            label="Lessons Done"
            value={stats?.lessons_completed || 0}
            accent="bg-sky-50 text-sky-600"
            icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><rect x={4} y={4} width={16} height={16} rx={3} stroke="currentColor" strokeWidth={1.8} /><path d="m8.5 12 2.5 2.5L16 9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>}
          />
          <StatsCard
            label="Time Spent"
            value={formatTime(stats?.total_time_spent)}
            accent="bg-amber-50 text-amber-600"
            icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>}
          />
        </div>

        {/* Course Progress */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">My Courses Progress</h2>
          {enrollments.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">No courses yet</h3>
              <p className="mt-1 text-sm text-gray-500">Enroll in a course to start tracking your progress.</p>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {enrollments.map((e) => (
                <CourseProgressCard key={e.id} enrollment={e} />
              ))}
            </ul>
          )}
        </section>

        {/* Recent Activity */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
          <RecentActivity activities={recentActivity} />
        </section>

      </div>
    </div>
  );
};

export default StudentProgressPage;