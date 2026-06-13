import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../lib/axios.js';

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const Spinner = () => (
  <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={3} opacity={0.25} />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const ChatIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

const CourseStudentsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    loadStudents();
  }, [courseId, page]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const [courseRes, studentsRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/enrollments/course/${courseId}/students`, { params: { page, limit: 20 } }),
      ]);
      setCourse(courseRes.data.data);
      setStudents(studentsRes.data.data || []);
      setMeta(studentsRes.data.meta);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-6 lg:px-8">

        <header className="mb-6">
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            {course?.title || 'Course Students'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {meta?.total || 0} enrolled students
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-base font-semibold text-gray-900">No students yet</p>
            <p className="mt-1 text-sm text-gray-500">Students will appear here once they enroll.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <ul className="divide-y divide-gray-100">
              {students.map((enrollment) => (
                <li key={enrollment.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                  <div className="flex items-center gap-3 min-w-0">
                    {enrollment.avatar ? (
                      <img src={enrollment.avatar} alt={enrollment.name} className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                        {getInitials(enrollment.name)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{enrollment.name}</p>
                      <p className="text-sm text-gray-500 truncate">{enrollment.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 sm:ml-auto sm:flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500">Progress</p>
                        <p className="text-sm font-semibold text-gray-900">{Math.round(enrollment.progress || 0)}%</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500">Enrolled</p>
                        <p className="text-sm text-gray-600">{new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                      </div>
                      {enrollment.completed && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          Completed
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/instructor/messages/${enrollment.user_id}`)}
                      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                    >
                      <ChatIcon /> <span className="hidden sm:inline">Message</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {meta?.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-4 sm:px-5">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {meta.totalPages}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= meta.totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CourseStudentsPage;