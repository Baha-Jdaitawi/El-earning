import { useState } from 'react';
import Button from '../../../shared/components/Button.jsx';

const StarIcon = ({ filled, hovered, onClick, onMouseEnter, onMouseLeave }) => (
  <button
    type="button"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className="focus:outline-none"
  >
    <svg
      className={`h-8 w-8 transition-colors ${filled || hovered ? 'text-amber-400' : 'text-gray-300'}`}
      viewBox="0 0 24 24"
      fill={filled || hovered ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  </button>
);

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

const ReviewForm = ({ onSubmit, onCancel, loading, initialData = null }) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(initialData?.comment || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return;
    onSubmit({ rating, comment: comment.trim() });
  };

  const displayRating = hoveredRating || rating;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Your Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={star <= rating}
              hovered={star <= hoveredRating}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            />
          ))}
          {displayRating > 0 && (
            <span className="ml-2 text-sm font-medium text-amber-600">
              {RATING_LABELS[displayRating]}
            </span>
          )}
        </div>
        {!rating && (
          <p className="text-xs text-gray-400">Click a star to rate</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Your Review <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this course..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-y leading-relaxed"
        />
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={loading} disabled={!rating}>
          {initialData ? 'Update Review' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;