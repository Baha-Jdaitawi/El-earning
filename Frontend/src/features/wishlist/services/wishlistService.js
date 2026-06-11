import {
  getWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
  checkWishlistApi,
} from '../api/wishlistApi.js';

export const getWishlistService = async () => {
  const res = await getWishlistApi();
  return res.data.data;
};

export const addToWishlistService = async (course_id) => {
  const res = await addToWishlistApi(course_id);
  return res.data.data;
};

export const removeFromWishlistService = async (course_id) => {
  await removeFromWishlistApi(course_id);
};

export const checkWishlistService = async (course_id) => {
  const res = await checkWishlistApi(course_id);
  return res.data.data.inWishlist;
};