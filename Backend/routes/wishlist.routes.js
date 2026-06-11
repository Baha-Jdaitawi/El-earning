import express from 'express';
import {
  getWishlistHandler,
  addToWishlistHandler,
  removeFromWishlistHandler,
  checkWishlistHandler,
} from '../controllers/wishlistController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('student'));

router.get('/', getWishlistHandler);
router.post('/', addToWishlistHandler);
router.get('/:course_id/check', checkWishlistHandler);
router.delete('/:course_id', removeFromWishlistHandler);

export default router;