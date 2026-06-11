import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  getWishlist,
} from '../models/wishlistModel.js';

export const getWishlistHandler = async (req, res) => {
  try {
    const wishlist = await getWishlist(req.user.id);
    res.json({ success: true, data: wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addToWishlistHandler = async (req, res) => {
  try {
    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ success: false, message: 'Course ID is required' });
    const item = await addToWishlist(req.user.id, parseInt(course_id));
    res.status(201).json({ success: true, message: 'Added to wishlist', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeFromWishlistHandler = async (req, res) => {
  try {
    const { course_id } = req.params;
    await removeFromWishlist(req.user.id, parseInt(course_id));
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const checkWishlistHandler = async (req, res) => {
  try {
    const { course_id } = req.params;
    const inWishlist = await isInWishlist(req.user.id, parseInt(course_id));
    res.json({ success: true, data: { inWishlist } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};