import express from 'express';
import {
  getModules,
  getModule,
  createModuleHandler,
  updateModuleHandler,
  deleteModuleHandler,
  reorderModulesHandler,
} from '../controllers/moduleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/course/:course_id', authenticate, getModules);
router.get('/:id', authenticate, getModule);
router.post('/', authenticate, authorize('instructor', 'admin'), createModuleHandler);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateModuleHandler);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteModuleHandler);
router.patch('/course/:course_id/reorder', authenticate, authorize('instructor', 'admin'), reorderModulesHandler);

export default router;