import { query } from '../config/db.js';

export const getAllCategories = async () => {
  const result = await query('SELECT * FROM categories ORDER BY name');
  return result.rows;
};

export const getCategoryById = async (id) => {
  const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createCategory = async ({ name, description }) => {
  const result = await query(
    'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
    [name, description || null]
  );
  return result.rows[0];
};

export const updateCategory = async (id, { name, description }) => {
  const result = await query(
    `UPDATE categories SET name = COALESCE($1, name), description = COALESCE($2, description)
     WHERE id = $3 RETURNING *`,
    [name || null, description || null, id]
  );
  return result.rows[0] || null;
};

export const deleteCategory = async (id) => {
  const check = await query(
    'SELECT COUNT(*) FROM courses WHERE category_id = $1 AND is_deleted = FALSE',
    [id]
  );
  if (parseInt(check.rows[0].count) > 0) {
    throw new Error('Cannot delete category that has courses');
  }
  const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
};

export const categoryNameExists = async (name, excludeId = null) => {
  let text = 'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)';
  const params = [name];
  if (excludeId) {
    text += ' AND id != $2';
    params.push(excludeId);
  }
  const result = await query(text, params);
  return result.rows.length > 0;
};

export const getCategoriesWithCourseCount = async () => {
  const result = await query(
    `SELECT c.*, COUNT(co.id) as course_count
     FROM categories c
     LEFT JOIN courses co ON c.id = co.category_id AND co.is_deleted = FALSE
     GROUP BY c.id
     ORDER BY c.name`
  );
  return result.rows;
};