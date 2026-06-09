import express from 'express';
import {
  getCategories,
  getCategory,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', authenticate, authorize('admin'), createCategoryHandler);
router.put('/:id', authenticate, authorize('admin'), updateCategoryHandler);
router.delete('/:id', authenticate, authorize('admin'), deleteCategoryHandler);

export default router;