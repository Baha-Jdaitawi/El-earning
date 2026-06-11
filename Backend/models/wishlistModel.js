import { query } from '../config/db.js';

export const addToWishlist = async (user_id, course_id) => {
  const result = await query(
    `INSERT INTO wishlist (user_id, course_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [user_id, course_id]
  );
  return result.rows[0] || null;
};

export const removeFromWishlist = async (user_id, course_id) => {
  const result = await query(
    'DELETE FROM wishlist WHERE user_id = $1 AND course_id = $2 RETURNING id',
    [user_id, course_id]
  );
  return result.rows[0] || null;
};

export const isInWishlist = async (user_id, course_id) => {
  const result = await query(
    'SELECT id FROM wishlist WHERE user_id = $1 AND course_id = $2',
    [user_id, course_id]
  );
  return result.rows.length > 0;
};

export const getWishlist = async (user_id) => {
  const result = await query(
    `SELECT w.*, c.title, c.thumbnail, c.level, c.price, c.description,
            cat.name as category_name, u.name as instructor_name,
            COUNT(DISTINCT e.id) as enrolled_students
     FROM wishlist w
     JOIN courses c ON w.course_id = c.id
     LEFT JOIN categories cat ON c.category_id = cat.id
     LEFT JOIN users u ON c.instructor_id = u.id
     LEFT JOIN enrollments e ON c.id = e.course_id
     WHERE w.user_id = $1 AND c.is_deleted = FALSE
     GROUP BY w.id, c.id, cat.name, u.name
     ORDER BY w.created_at DESC`,
    [user_id]
  );
  return result.rows;
};