import { useNavigate } from 'react-router-dom';

const CATEGORY_THUMBNAILS = {
  'Web Development': 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80',
  'Mobile Development': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
  'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'DevOps': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
  'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
};

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';

const EnrolledCourseCard = ({ enrollment }) => {
  const navigate = useNavigate();
  const progress = Math.round(parseFloat(enrollment.progress || 0));
  const thumbnail = enrollment.thumbnail ||
    CATEGORY_THUMBNAILS[enrollment.category_name] ||
    DEFAULT_THUMBNAIL;

  return (
    <div
      onClick={() => navigate(`/courses/${enrollment.course_id}`)}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={enrollment.title}
          onError={(e) => { e.target.src = DEFAULT_THUMBNAIL; }}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {enrollment.completed && (
          <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
            Completed
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <h3 className="font-semibold leading-snug text-gray-900">{enrollment.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{enrollment.instructor_name}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-semibold text-gray-900">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            enrollment.level === 'beginner' ? 'bg-emerald-100 text-emerald-700' :
            enrollment.level === 'intermediate' ? 'bg-sky-100 text-sky-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {enrollment.level}
          </span>
          <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
            {progress > 0 ? 'Continue' : 'Start'} →
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnrolledCourseCard;