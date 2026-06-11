import { query } from '../config/db.js';

export const createCourse = async ({ title, description, category_id, instructor_id, price, thumbnail, level, duration_weeks, is_published }) => {
  const result = await query(
    `INSERT INTO courses (title, description, category_id, instructor_id, price, thumbnail, level, duration_weeks, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [title, description, category_id, instructor_id, price || 0, thumbnail || null, level || 'beginner', duration_weeks || 1, is_published || false]
  );
  return result.rows[0];
};

export const getCourseById = async (id) => {
  const result = await query(
    `SELECT c.*, cat.name as category_name, u.name as instructor_name, u.avatar as instructor_avatar,
            COUNT(DISTINCT e.id) as enrolled_students
     FROM courses c
     LEFT JOIN categories cat ON c.category_id = cat.id
     LEFT JOIN users u ON c.instructor_id = u.id
     LEFT JOIN enrollments e ON c.id = e.course_id
     WHERE c.id = $1 AND c.is_deleted = FALSE
     GROUP BY c.id, cat.name, u.name, u.avatar`,
    [id]
  );
  return result.rows[0] || null;
};

export const getAllCourses = async ({ page = 1, limit = 10, category_id, level, search, instructor_id, is_published }) => {
  const offset = (page - 1) * limit;
  const conditions = ['c.is_deleted = FALSE'];
  const values = [];
  let i = 1;

  if (category_id) { conditions.push(`c.category_id = $${i++}`); values.push(category_id); }
  if (level) { conditions.push(`c.level = $${i++}`); values.push(level); }
  if (instructor_id) { conditions.push(`c.instructor_id = $${i++}`); values.push(instructor_id); }
  if (is_published !== undefined && is_published !== null) { conditions.push(`c.is_published = $${i++}`); values.push(is_published); }
  if (search) {
    conditions.push(`(LOWER(c.title) LIKE $${i} OR LOWER(c.description) LIKE $${i} OR LOWER(u.name) LIKE $${i})`);
    values.push(`%${search.toLowerCase()}%`);
    i++;
  }

  const where = conditions.join(' AND ');
const countResult = await query(
    `SELECT COUNT(*) FROM courses c
     LEFT JOIN users u ON c.instructor_id = u.id
     WHERE ${where}`,
    values
  );
  const total = parseInt(countResult.rows[0].count);

  const result = await query(
    `SELECT c.*, cat.name as category_name, u.name as instructor_name, u.avatar as instructor_avatar,
            COUNT(DISTINCT e.id) as enrolled_students
     FROM courses c
     LEFT JOIN categories cat ON c.category_id = cat.id
     LEFT JOIN users u ON c.instructor_id = u.id
     LEFT JOIN enrollments e ON c.id = e.course_id
     WHERE ${where}
     GROUP BY c.id, cat.name, u.name, u.avatar
     ORDER BY c.created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...values, limit, offset]
  );

  return { courses: result.rows, total };
};

export const updateCourse = async (id, updates) => {
  const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`);
  const values = [...Object.values(updates), id];

  const result = await query(
    `UPDATE courses SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length} AND is_deleted = FALSE
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

export const deleteCourse = async (id) => {
  const result = await query(
    'UPDATE courses SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
};

export const getCoursesByInstructor = async (instructor_id) => {
  const result = await query(
    `SELECT c.*, cat.name as category_name, COUNT(DISTINCT e.id) as enrolled_students
     FROM courses c
     LEFT JOIN categories cat ON c.category_id = cat.id
     LEFT JOIN enrollments e ON c.id = e.course_id
     WHERE c.instructor_id = $1 AND c.is_deleted = FALSE
     GROUP BY c.id, cat.name
     ORDER BY c.created_at DESC`,
    [instructor_id]
  );
  return result.rows;
};

export const getFeaturedCourses = async (limit = 6) => {
  const result = await query(
    `SELECT c.*, cat.name as category_name, u.name as instructor_name,
            COUNT(DISTINCT e.id) as enrolled_students
     FROM courses c
     LEFT JOIN categories cat ON c.category_id = cat.id
     LEFT JOIN users u ON c.instructor_id = u.id
     LEFT JOIN enrollments e ON c.id = e.course_id
     WHERE c.is_published = TRUE AND c.is_deleted = FALSE
     GROUP BY c.id, cat.name, u.name
     ORDER BY enrolled_students DESC, c.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

export const courseTitleExistsForInstructor = async (instructor_id, title, excludeId = null) => {
  let text = 'SELECT id FROM courses WHERE instructor_id = $1 AND LOWER(title) = LOWER($2) AND is_deleted = FALSE';
  const params = [instructor_id, title];
  if (excludeId) {
    text += ' AND id != $3';
    params.push(excludeId);
  }
  const result = await query(text, params);
  return result.rows.length > 0;
};