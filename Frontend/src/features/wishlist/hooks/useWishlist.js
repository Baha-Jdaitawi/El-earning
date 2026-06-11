import { useState, useEffect } from 'react';
import {
  getWishlistService,
  addToWishlistService,
  removeFromWishlistService,
  checkWishlistService,
} from '../services/wishlistService.js';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const data = await getWishlistService();
      setWishlist(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const addToWishlist = async (course_id) => {
    try {
      await addToWishlistService(course_id);
      await loadWishlist();
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromWishlist = async (course_id) => {
    try {
      await removeFromWishlistService(course_id);
      setWishlist((prev) => prev.filter((item) => item.course_id !== course_id));
    } catch (err) {
      console.error(err);
    }
  };

  return { wishlist, loading, addToWishlist, removeFromWishlist, reload: loadWishlist };
};

export const useWishlistStatus = (course_id) => {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!course_id) return;
    checkWishlistService(course_id).then(setInWishlist).catch(() => {});
  }, [course_id]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlistService(course_id);
        setInWishlist(false);
      } else {
        await addToWishlistService(course_id);
        setInWishlist(true);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return { inWishlist, loading, toggle };
};