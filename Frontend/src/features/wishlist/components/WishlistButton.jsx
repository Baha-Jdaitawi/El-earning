import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { checkWishlistService, addToWishlistService, removeFromWishlistService } from '../services/wishlistService.js';

const HeartIcon = ({ filled }) => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WishlistButton = ({ courseId, className }) => {
  const { user } = useSelector((state) => state.auth);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'student' && courseId) {
      checkWishlistService(courseId)
        .then(setInWishlist)
        .catch(() => {});
    }
  }, [courseId, user]);

  if (!user || user.role !== 'student') return null;

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlistService(courseId);
        setInWishlist(false);
      } else {
        await addToWishlistService(courseId);
        setInWishlist(true);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`flex items-center justify-center rounded-full p-1.5 transition-colors disabled:opacity-50 ${
        inWishlist
          ? 'text-rose-500 hover:text-rose-600'
          : 'text-gray-400 hover:text-rose-400'
      } ${className || ''}`}
    >
      <HeartIcon filled={inWishlist} />
    </button>
  );
};

export default WishlistButton;