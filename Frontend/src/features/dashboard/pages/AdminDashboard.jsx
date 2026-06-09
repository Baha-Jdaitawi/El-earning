import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUsersApi, getUserStatsApi, getCategoriesApi } from '../api/dashboardApi.js';
import { getCoursesApi } from '../../courses/api/coursesApi.js';
import api from '../../../lib/axios.js';

const ROLE_STYLES = {
  student: 'bg-sky-100 text-sky-700',
  instructor: 'bg-amber-100 text-amber-700',
  admin: 'bg-rose-100 text-rose-700',
};

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const StatCard = ({ label, value, icon, accent }) => (
  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${accent}`}>
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-2xl font-bold leading-tight text-gray-900">{value}</p>
      <p className="truncate text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ROLE_STYLES[role] || 'bg-gray-100 text-gray-700'}`}>
    {role}
  </span>
);

const StatusBadge = ({ published }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-gray-400'}`} />
    {published ? 'Published' : 'Draft'}
  </span>
);

const RegistrationChart = ({ data }) => {
  const max = Math.max(1, ...data.map((d) => d.registrations));
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex h-52 items-end justify-between gap-2 sm:gap-4">
        {data.map((day, i) => {
          const heightPct = Math.round((day.registrations / max) * 100);
          return (
            <div key={i} className="flex h-full flex-1 flex-col items-center gap-2">
              <span className="text-xs font-medium text-gray-600">{day.registrations}</span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-indigo-600 hover:bg-indigo-500 transition-all"
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    getUserStatsApi().then((res) => {
      setStats(res.data.overview);
      setTrends(res.data.registrationTrends?.slice(0, 7).reverse() || []);
    }).catch(() => {});

    getUsersApi({ page: 1, limit: 5 }).then((res) => setRecentUsers(res.data.data || [])).catch(() => {});
    getCoursesApi({ page: 1, limit: 5 }).then((res) => setRecentCourses(res.data.data || [])).catch(() => {});
  }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setRecentUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here's what's happening across LearnHub today.</p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total Users" value={stats?.totalUsers?.toLocaleString() || 0} accent="bg-indigo-50 text-indigo-600" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><circle cx={9} cy={8} r={3.2} stroke="currentColor" strokeWidth={1.8} /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-3-4.9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" /></svg>} />
          <StatCard label="Total Students" value={stats?.totalStudents?.toLocaleString() || 0} accent="bg-sky-50 text-sky-600" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M12 4 2 9l10 5 10-5-10-5Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" /><path d="M6 11v4.5c0 .8 2.7 2.5 6 2.5s6-1.7 6-2.5V11" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>} />
          <StatCard label="Total Instructors" value={stats?.totalInstructors?.toLocaleString() || 0} accent="bg-amber-50 text-amber-600" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><rect x={3} y={4} width={18} height={12} rx={1.5} stroke="currentColor" strokeWidth={1.8} /><path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" /></svg>} />
          <StatCard label="Total Courses" value={stats?.totalCourses?.toLocaleString() || 0} accent="bg-teal-50 text-teal-600" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" /></svg>} />
          <StatCard label="Total Enrollments" value={stats?.totalEnrollments?.toLocaleString() || 0} accent="bg-emerald-50 text-emerald-600" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M9 12.5 11 14.5 15.5 10M12 3l8 4v5c0 4.5-3 7.5-8 9-5-1.5-8-4.5-8-9V7l8-4Z" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>} />
          <StatCard label="Active This Week" value={stats?.activeUsersThisWeek?.toLocaleString() || 0} accent="bg-rose-50 text-rose-600" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M3 12h4l2-6 4 12 2-6h6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>} />
        </section>

        {/* Registration Trends */}
        {trends.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">User Registration Trends</h2>
            <RegistrationChart data={trends} />
          </section>
        )}

        {/* Recent Users */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <Link to="/admin/users" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {recentUsers.length > 0 ? (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Joined</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                                {getInitials(u.name)}
                              </span>
                              <span className="font-medium text-gray-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">{u.email}</td>
                          <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                          <td className="px-5 py-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className="divide-y divide-gray-100 md:hidden">
                  {recentUsers.map((u) => (
                    <li key={u.id} className="flex flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                            {getInitials(u.name)}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                        <RoleBadge role={u.role} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Joined {new Date(u.created_at).toLocaleDateString()}</span>
                        <button onClick={() => handleDeleteUser(u.id)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="p-8 text-center text-sm text-gray-500">No users yet.</p>
            )}
          </div>
        </section>

        {/* Recent Courses */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Courses</h2>
            <Link to="/admin/courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {recentCourses.length > 0 ? (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                        <th className="px-5 py-3">Course</th>
                        <th className="px-5 py-3">Instructor</th>
                        <th className="px-5 py-3">Students</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentCourses.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4 font-medium text-gray-900">{c.title}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{c.instructor_name}</td>
                          <td className="px-5 py-4 text-sm text-gray-700">{parseInt(c.enrolled_students || 0).toLocaleString()}</td>
                          <td className="px-5 py-4"><StatusBadge published={c.is_published} /></td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              <button
                                onClick={() => navigate(`/courses/${c.id}`)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className="divide-y divide-gray-100 md:hidden">
                  {recentCourses.map((c) => (
                    <li key={c.id} className="flex flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-medium text-gray-900">{c.title}</span>
                        <StatusBadge published={c.is_published} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{c.instructor_name} · {parseInt(c.enrolled_students || 0)} students</span>
                        <button onClick={() => navigate(`/courses/${c.id}`)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                          View
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="p-8 text-center text-sm text-gray-500">No courses yet.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;