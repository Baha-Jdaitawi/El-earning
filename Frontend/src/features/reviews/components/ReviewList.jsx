const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const StarRating = ({ rating, size = 'sm' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizes[size]} ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
};

const RatingBar = ({ label, count, total }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-right text-xs text-gray-500">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-xs text-gray-500">{count}</span>
    </div>
  );
};

const ReviewCard = ({ review }) => (
  <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {review.student_avatar ? (
          <img src={review.student_avatar} alt={review.student_name} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {getInitials(review.student_name)}
          </span>
        )}
        <div>
          <p className="font-medium text-gray-900">{review.student_name}</p>
          <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
      <StarRating rating={review.rating} />
    </div>
    {review.comment && (
      <p className="text-sm leading-relaxed text-gray-700">{review.comment}</p>
    )}
  </div>
);

const ReviewList = ({ reviews, stats, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-gray-200" />
                <div className="h-2.5 w-20 rounded bg-gray-100" />
              </div>
            </div>
            <div className="mt-3 h-3 w-full rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
        <p className="text-base font-semibold text-gray-900">No reviews yet</p>
        <p className="mt-1 text-sm text-gray-500">Be the first to review this course.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      {stats && parseInt(stats.total_reviews) > 0 && (
        <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div className="flex flex-col items-center gap-1 sm:w-32">
            <p className="text-5xl font-bold text-gray-900">{stats.average_rating}</p>
            <StarRating rating={Math.round(parseFloat(stats.average_rating))} size="md" />
            <p className="text-xs text-gray-500">{stats.total_reviews} reviews</p>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <RatingBar label="5 stars" count={parseInt(stats.five_star)} total={parseInt(stats.total_reviews)} />
            <RatingBar label="4 stars" count={parseInt(stats.four_star)} total={parseInt(stats.total_reviews)} />
            <RatingBar label="3 stars" count={parseInt(stats.three_star)} total={parseInt(stats.total_reviews)} />
            <RatingBar label="2 stars" count={parseInt(stats.two_star)} total={parseInt(stats.total_reviews)} />
            <RatingBar label="1 star" count={parseInt(stats.one_star)} total={parseInt(stats.total_reviews)} />
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};

export default ReviewList;