import { Link } from 'react-router-dom';

const LEVEL_STYLES = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-sky-100 text-sky-700',
  advanced: 'bg-purple-100 text-purple-700',
};

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

const CourseCard = ({ course }) => {
  const thumbnail = course.thumbnail ||
    CATEGORY_THUMBNAILS[course.category_name] ||
    DEFAULT_THUMBNAIL;

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={course.title}
          onError={(e) => { e.target.src = DEFAULT_THUMBNAIL; }}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {course.category_name}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <h3 className="font-semibold leading-snug text-gray-900">{course.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{course.instructor_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${LEVEL_STYLES[course.level] || 'bg-gray-100 text-gray-700'}`}>
            {course.level}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <UsersIcon />
            {parseInt(course.enrolled_students || 0).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className={`text-base font-bold ${parseFloat(course.price) === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
            {parseFloat(course.price) === 0 ? 'Free' : `$${course.price}`}
          </span>
          <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
            View course
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;