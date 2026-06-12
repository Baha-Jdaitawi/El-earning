import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getInstructorCoursesApi, deleteCourseApi } from '../../courses/api/coursesApi.js';
import { getPendingSubmissionsApi } from '../../assignments/api/assignmentsApi.js';

const BookIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className || 'h-6 w-6'} viewBox="0 0 24 24" fill="none">
    <circle cx={9} cy={8} r={3.2} stroke="currentColor" strokeWidth={1.8} />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-3-4.9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const InboxIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
    <path d="M4 13 6 5h12l2 8M4 13v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5M4 13h4l1.5 2.5h5L16 13h4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2 4 20Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
    <path d="m14 8 2.8 2.8" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const ViewIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.8} />
  </svg>
);

const BuilderIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <rect x={3} y={3} width={8} height={8} rx={1.5} stroke="currentColor" strokeWidth={1.8} />
    <rect x={13} y={3} width={8} height={8} rx={1.5} stroke="currentColor" strokeWidth={1.8} />
    <rect x={3} y={13} width={8} height={8} rx={1.5} stroke="currentColor" strokeWidth={1.8} />
    <rect x={13} y={13} width={8} height={8} rx={1.5} stroke="currentColor" strokeWidth={1.8} />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChatIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

const CATEGORY_STYLES = {
  'Web Development': 'bg-indigo-100 text-indigo-700',
  'Data Science': 'bg-teal-100 text-teal-700',
  'Design': 'bg-amber-100 text-amber-700',
  'Mobile Development': 'bg-rose-100 text-rose-700',
  'DevOps': 'bg-purple-100 text-purple-700',
};

const LEVEL_STYLES = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-sky-100 text-sky-700',
  advanced: 'bg-purple-100 text-purple-700',
};

const StatCard = ({ label, value, Icon, accent }) => (
  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${accent}`}>
      <Icon />
    </span>
    <div className="min-w-0">
      <p className="text-2xl font-bold leading-tight text-gray-900">{value}</p>
      <p className="truncate text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const StatusBadge = ({ published }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-gray-400'}`} />
    {published ? 'Published' : 'Draft'}
  </span>
);

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);

  useEffect(() => {
    loadCourses();
    getPendingSubmissionsApi().then((res) => setPendingSubmissions(res.data.data || [])).catch(() => {});
  }, []);

  const loadCourses = () => {
    getInstructorCoursesApi().then((res) => setCourses(res.data.data || [])).catch(() => {});
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourseApi(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete course. Make sure it has no enrolled students.');
    }
  };

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.is_published).length,
    totalStudents: courses.reduce((sum, c) => sum + parseInt(c.enrolled_students || 0), 0),
    pendingSubmissions: pendingSubmissions.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Manage your courses and review student submissions.</p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Courses" value={stats.totalCourses} Icon={BookIcon} accent="bg-indigo-50 text-indigo-600" />
          <StatCard label="Published Courses" value={stats.publishedCourses} Icon={GlobeIcon} accent="bg-emerald-50 text-emerald-600" />
          <StatCard label="Total Students" value={stats.totalStudents} Icon={UsersIcon} accent="bg-teal-50 text-teal-600" />
          <StatCard label="Pending Submissions" value={stats.pendingSubmissions} Icon={InboxIcon} accent="bg-amber-50 text-amber-600" />
        </section>

        {/* My Courses */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
            <Link to="/instructor/courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>

          {courses.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-3">Course</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Level</th>
                      <th className="px-5 py-3">Students</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-medium text-gray-900">{course.title}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[course.category_name] || 'bg-gray-100 text-gray-700'}`}>
                            {course.category_name}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${LEVEL_STYLES[course.level] || 'bg-gray-100 text-gray-700'}`}>
                            {course.level}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">{parseInt(course.enrolled_students || 0).toLocaleString()}</td>
                        <td className="px-5 py-4"><StatusBadge published={course.is_published} /></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/instructor/courses/${course.id}/builder`)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                            >
                              <BuilderIcon /> Manage
                            </button>
                            <button
                              onClick={() => navigate(`/instructor/courses/${course.id}/students`)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700"
                            >
                              <UsersIcon className="h-4 w-4" /> Students
                            </button>
                            <button
                              onClick={() => navigate(`/instructor/courses/${course.id}/chat`)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700"
                            >
                              <ChatIcon /> Chat
                            </button>
                            <button
                              onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700"
                            >
                              <EditIcon /> Edit
                            </button>
                            <button
                              onClick={() => navigate(`/courses/${course.id}`)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700"
                            >
                              <ViewIcon /> View
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                            >
                              <TrashIcon /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <ul className="divide-y divide-gray-100 md:hidden">
                {courses.map((course) => (
                  <li key={course.id} className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-medium text-gray-900">{course.title}</span>
                      <StatusBadge published={course.is_published} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[course.category_name] || 'bg-gray-100 text-gray-700'}`}>
                        {course.category_name}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${LEVEL_STYLES[course.level] || 'bg-gray-100 text-gray-700'}`}>
                        {course.level}
                      </span>
                      <span className="text-xs text-gray-500">{parseInt(course.enrolled_students || 0)} students</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => navigate(`/instructor/courses/${course.id}/builder`)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                      >
                        <BuilderIcon /> Manage
                      </button>
                      <button
                        onClick={() => navigate(`/instructor/courses/${course.id}/students`)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <UsersIcon className="h-4 w-4" /> Students
                      </button>
                      <button
                        onClick={() => navigate(`/instructor/courses/${course.id}/chat`)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <ChatIcon /> Chat
                      </button>
                      <button
                        onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <EditIcon /> Edit
                      </button>
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <ViewIcon /> View
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <TrashIcon /> Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              You haven't created any courses yet.
            </p>
          )}
        </section>

        {/* Pending Submissions */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending Submissions</h2>
            {pendingSubmissions.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                {pendingSubmissions.length} to grade
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {pendingSubmissions.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {pendingSubmissions.map((s) => (
                  <li key={s.id} className="flex items-center gap-4 p-4">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
                      {getInitials(s.student_name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{s.assignment_title}</p>
                      <p className="truncate text-xs text-gray-500">{s.student_name} · {s.course_title}</p>
                    </div>
                    <span className="hidden flex-shrink-0 items-center gap-1 text-xs text-gray-400 sm:flex">
                      <ClockIcon />
                      {new Date(s.submitted_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => navigate('/instructor/submissions')}
                      className="flex-shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      Grade
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-8 text-center text-sm text-gray-500">No pending submissions. You're all caught up.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default InstructorDashboard;