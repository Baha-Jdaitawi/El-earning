import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryNameExists,
  getCategoriesWithCourseCount,
} from '../models/categoryModel.js';

export const getCategories = async (req, res) => {
  try {
    const { withCount } = req.query;
    const categories = withCount === 'true'
      ? await getCategoriesWithCourseCount()
      : await getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = await getCategoryById(parseInt(req.params.id));
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCategoryHandler = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const exists = await categoryNameExists(name);
    if (exists) return res.status(409).json({ success: false, message: 'Category already exists' });

    const category = await createCategory({ name: name.trim(), description });
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategoryHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;

    const existing = await getCategoryById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Category not found' });

    if (name) {
      const taken = await categoryNameExists(name, id);
      if (taken) return res.status(409).json({ success: false, message: 'Category name already taken' });
    }

    const updated = await updateCategory(id, { name, description });
    res.json({ success: true, message: 'Category updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCategoryHandler = async (req, res) => {
  try {
    const deleted = await deleteCategory(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    if (err.message.includes('has courses')) {
      return res.status(409).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};