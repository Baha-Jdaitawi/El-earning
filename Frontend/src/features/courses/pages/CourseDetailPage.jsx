import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourse } from '../../../store/slices/coursesSlice.js';
import { enroll, fetchEnrollmentStatus } from '../../../store/slices/enrollmentSlice.js';

const CATEGORY_THUMBNAILS = {
  'Web Development': 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80',
  'Mobile Development': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
  'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'DevOps': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
  'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
};

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';

const UsersIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle cx={9} cy={8} r={3.2} stroke="currentColor" strokeWidth={1.8} />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-3-4.9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const PlayIcon = ({ className }) => (
  <svg className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="M10 8.5v7l5.5-3.5L10 8.5Z" fill="currentColor" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <rect x={5} y={10} width={14} height={10} rx={2} stroke="currentColor" strokeWidth={1.8} />
    <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const LevelIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path d="M5 19V11M12 19V5M19 19v-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const ModulesIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <rect x={4} y={4} width={16} height={5} rx={1.5} stroke="currentColor" strokeWidth={1.8} />
    <rect x={4} y={13} width={16} height={5} rx={1.5} stroke="currentColor" strokeWidth={1.8} />
  </svg>
);

const ChevronDown = ({ open }) => (
  <svg className={`h-5 w-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none">
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={3} opacity={0.25} />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const LEVEL_STYLES = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-sky-100 text-sky-700',
  advanced: 'bg-purple-100 text-purple-700',
};

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const formatDuration = (seconds) => {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const StatItem = ({ Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      <Icon />
    </span>
    <div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

const CourseDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { course, loading } = useSelector((state) => state.courses);
  const { status } = useSelector((state) => state.enrollment);
  const { user } = useSelector((state) => state.auth);
  const [modules, setModules] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const [openModule, setOpenModule] = useState(null);

  const enrolled = status?.enrolled || false;
  const isStudent = !user || user.role === 'student';

 useEffect(() => {
  dispatch(fetchCourse(parseInt(id)));
  if (user && user.role === 'student') dispatch(fetchEnrollmentStatus(parseInt(id)));
}, [dispatch, id, user]);

  useEffect(() => {
    if (course?.id) {
      fetch(`${import.meta.env.VITE_API_URL}/modules/course/${id}`, { credentials: 'include' })
        .then((r) => r.json())
        .then(async (res) => {
          const modulesData = res.data || [];
          const modulesWithLessons = await Promise.all(
            modulesData.map(async (m) => {
              const lessonRes = await fetch(`${import.meta.env.VITE_API_URL}/lessons/module/${m.id}`, { credentials: 'include' });
              const lessonData = await lessonRes.json();
              return { ...m, lessons: lessonData.data || [] };
            })
          );
          setModules(modulesWithLessons);
          if (modulesWithLessons.length > 0) setOpenModule(modulesWithLessons[0].id);
        })
        .catch(() => {});
    }
  }, [course?.id, id]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    if (enrolled) {
      const firstModule = modules[0];
      const firstLesson = firstModule?.lessons?.[0];
      if (firstLesson) return navigate(`/learn/${id}/lesson/${firstLesson.id}`);
      return navigate('/dashboard');
    }
    setEnrolling(true);
    const result = await dispatch(enroll(parseInt(id)));
    setEnrolling(false);
    if (result.meta.requestStatus === 'fulfilled') {
      const firstModule = modules[0];
      const firstLesson = firstModule?.lessons?.[0];
      if (firstLesson) return navigate(`/learn/${id}/lesson/${firstLesson.id}`);
      navigate('/dashboard');
    }
  };

  const totalLessons = modules.reduce((sum, m) => sum + parseInt(m.lesson_count || 0), 0);
  const totalDuration = modules.reduce((sum, m) => sum + parseInt(m.total_duration || 0), 0);
  const thumbnail = course?.thumbnail || CATEGORY_THUMBNAILS[course?.category_name] || DEFAULT_THUMBNAIL;

  if (loading || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                {course.category_name}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${LEVEL_STYLES[course.level] || 'bg-gray-100 text-gray-700'}`}>
                {course.level}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{course.title}</h1>
            <p className="leading-relaxed text-gray-600">{course.description}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                  {getInitials(course.instructor_name)}
                </span>
                {course.instructor_name}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UsersIcon />
                {parseInt(course.enrolled_students || 0).toLocaleString()} students
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <img
                src={thumbnail}
                alt={course.title}
                onError={(e) => { e.target.src = DEFAULT_THUMBNAIL; }}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between px-1">
              <span className={`text-2xl font-bold ${parseFloat(course.price) === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                {parseFloat(course.price) === 0 ? 'Free' : `$${course.price}`}
              </span>
              {enrolled && isStudent && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Enrolled
                </span>
              )}
            </div>
            {isStudent && (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {enrolling && <Spinner />}
                {enrolling ? 'Processing...' : enrolled ? 'Continue Learning' : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 sm:px-6 lg:grid-cols-4 lg:px-8">
          <StatItem Icon={ModulesIcon} label="Modules" value={modules.length} />
          <StatItem Icon={PlayIcon} label="Lessons" value={totalLessons} />
          <StatItem Icon={ClockIcon} label="Duration" value={formatDuration(totalDuration)} />
          <StatItem Icon={LevelIcon} label="Level" value={course.level} />
        </div>
      </section>

      {/* Modules + Sidebar */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">

        <section className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Course Content</h2>
          <div className="flex flex-col gap-3">
            {modules.map((module, index) => (
              <div key={module.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <button
                  onClick={() => setOpenModule((cur) => cur === module.id ? null : module.id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                      {index + 1}
                    </span>
                    <span className="truncate font-medium text-gray-900">{module.title}</span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className="hidden text-xs text-gray-500 sm:inline">{module.lesson_count} lessons</span>
                    <ChevronDown open={openModule === module.id} />
                  </div>
                </button>

                {openModule === module.id && module.lessons && (
                  <ul className="divide-y divide-gray-100 border-t border-gray-100">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center gap-3 px-5 py-3">
                        <span className={`flex-shrink-0 ${enrolled ? 'text-indigo-600' : 'text-gray-400'}`}>
                          {enrolled ? <PlayIcon className="h-5 w-5" /> : <LockIcon />}
                        </span>
                        <span className={`flex-1 truncate text-sm ${enrolled ? 'text-gray-900' : 'text-gray-500'}`}>
                          {lesson.title}
                        </span>
                        {lesson.video_duration > 0 && (
                          <span className="flex flex-shrink-0 items-center gap-1 text-xs text-gray-400">
                            <ClockIcon className="h-3.5 w-3.5" />
                            {formatDuration(lesson.video_duration)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Instructor sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Instructor</h2>
            <div className="flex items-center gap-3">
              {course.instructor_avatar ? (
                <img src={course.instructor_avatar} alt={course.instructor_name} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white">
                  {getInitials(course.instructor_name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{course.instructor_name}</p>
                <p className="text-sm text-gray-500">Instructor</p>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default CourseDetailPage;