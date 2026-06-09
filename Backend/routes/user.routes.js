import express from 'express';
import {
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  promoteToInstructor,
  demoteToStudent,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin'), getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUserById);
router.delete('/:id', authorize('admin'), deleteUserById);
router.patch('/:id/promote', authorize('admin'), promoteToInstructor);
router.patch('/:id/demote', authorize('admin'), demoteToStudent);

export default router;