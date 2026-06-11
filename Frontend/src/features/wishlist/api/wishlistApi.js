import api from '../../../lib/axios.js';

export const getWishlistApi = () => api.get('/wishlist');
export const addToWishlistApi = (course_id) => api.post('/wishlist', { course_id });
export const removeFromWishlistApi = (course_id) => api.delete(`/wishlist/${course_id}`);
export const checkWishlistApi = (course_id) => api.get(`/wishlist/${course_id}/check`);