import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist.js';

const CATEGORY_THUMBNAILS = {
  'Web Development': 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80',
  'Mobile Development': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
  'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'DevOps': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
  'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
};
const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';

const Spinner = () => (
  <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={3} opacity={0.25} />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const HeartIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
  </svg>
);

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlist, loading, removeFromWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">My Wishlist</h1>
          <p className="mt-1 text-sm text-gray-500">Courses you've saved for later.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-400">
              <HeartIcon />
            </span>
            <p className="mt-4 text-base font-semibold text-gray-900">No saved courses yet</p>
            <p className="mt-1 text-sm text-gray-500">Browse courses and click the heart icon to save them here.</p>
            <button
              onClick={() => navigate('/courses')}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((item) => {
              const thumbnail = item.thumbnail ||
                CATEGORY_THUMBNAILS[item.category_name] ||
                DEFAULT_THUMBNAIL;

              return (
                <div
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={thumbnail}
                      alt={item.title}
                      onError={(e) => { e.target.src = DEFAULT_THUMBNAIL; }}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => removeFromWishlist(item.course_id)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow hover:bg-white hover:text-rose-600"
                      title="Remove from wishlist"
                    >
                      <HeartIcon />
                    </button>
                    <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {item.category_name}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex-1">
                      <h3 className="font-semibold leading-snug text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{item.instructor_name}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className={`text-base font-bold ${parseFloat(item.price) === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {parseFloat(item.price) === 0 ? 'Free' : `$${item.price}`}
                      </span>
                      <button
                        onClick={() => navigate(`/courses/${item.course_id}`)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View course →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default WishlistPage;