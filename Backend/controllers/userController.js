import { getAllUsers, findUserById, updateUser, deleteUser, emailExists } from '../models/userModel.js';

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const { users, total } = await getAllUsers({ page: parseInt(page), limit: parseInt(limit), role, search });

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && parseInt(id) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const user = await findUserById(parseInt(id));
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (req.user.role !== 'admin' && parseInt(id) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updates = {};

    if (name) updates.name = name.trim();

    if (email) {
      const exists = await emailExists(email.toLowerCase().trim(), parseInt(id));
      if (exists) return res.status(409).json({ success: false, message: 'Email already in use' });
      updates.email = email.toLowerCase().trim();
    }

    if (role && req.user.role === 'admin') {
      if (!['student', 'instructor', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      updates.role = role;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    const updated = await updateUser(parseInt(id), updates);
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const deleted = await deleteUser(parseInt(id));
    if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const promoteToInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await findUserById(parseInt(id));
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'instructor') {
      return res.status(400).json({ success: false, message: 'User is already an instructor' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot change admin role' });
    }

    const updated = await updateUser(parseInt(id), { role: 'instructor' });
    res.status(200).json({ success: true, message: 'User promoted to instructor', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const demoteToStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await findUserById(parseInt(id));
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'student') {
      return res.status(400).json({ success: false, message: 'User is already a student' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot change admin role' });
    }

    const updated = await updateUser(parseInt(id), { role: 'student' });
    res.status(200).json({ success: true, message: 'User demoted to student', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};