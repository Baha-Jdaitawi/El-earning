import { query } from '../config/db.js';

export const createEnrollment = async (user_id, course_id) => {
  const result = await query(
    `INSERT INTO enrollments (user_id, course_id)
     VALUES ($1, $2)
     RETURNING *`,
    [user_id, course_id]
  );
  return result.rows[0];
};

export const getEnrollmentByUserAndCourse = async (user_id, course_id) => {
  const result = await query(
    `SELECT e.*, c.title as course_title
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE e.user_id = $1 AND e.course_id = $2`,
    [user_id, course_id]
  );
  return result.rows[0] || null;
};

export const isEnrolled = async (user_id, course_id) => {
  const result = await query(
    'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
    [user_id, course_id]
  );
  return result.rows.length > 0;
};

export const getUserEnrollments = async (user_id, { page = 1, limit = 10, completed } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = ['e.user_id = $1', 'c.is_deleted = FALSE'];
  const values = [user_id];
  let i = 2;

  if (completed !== undefined) {
    conditions.push(`e.completed = $${i++}`);
    values.push(completed);
  }

  const where = conditions.join(' AND ');

  const countResult = await query(
    `SELECT COUNT(*) FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE ${where}`,
    values
  );
  const total = parseInt(countResult.rows[0].count);

  const result = await query(
    `SELECT e.*, c.title, c.thumbnail, c.level, c.duration_weeks,
            cat.name as category_name, u.name as instructor_name,
            COUNT(DISTINCT l.id) as total_lessons
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     JOIN categories cat ON c.category_id = cat.id
     JOIN users u ON c.instructor_id = u.id
     LEFT JOIN modules m ON c.id = m.course_id AND m.is_published = TRUE
     LEFT JOIN lessons l ON m.id = l.module_id AND l.is_published = TRUE
     WHERE ${where}
     GROUP BY e.id, c.id, cat.name, u.name
     ORDER BY e.enrolled_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...values, limit, offset]
  );

  return { enrollments: result.rows, total };
};

export const getCourseEnrollments = async (course_id, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;

  const countResult = await query(
    'SELECT COUNT(*) FROM enrollments WHERE course_id = $1',
    [course_id]
  );
  const total = parseInt(countResult.rows[0].count);

  const result = await query(
    `SELECT e.*, u.name, u.email, u.avatar
     FROM enrollments e
     JOIN users u ON e.user_id = u.id
     WHERE e.course_id = $1
     ORDER BY e.enrolled_at DESC
     LIMIT $2 OFFSET $3`,
    [course_id, limit, offset]
  );

  return { enrollments: result.rows, total };
};

export const updateEnrollmentProgress = async (user_id, course_id, progress) => {
  const completed = progress >= 100;
  const result = await query(
    `UPDATE enrollments
     SET progress = $1, completed = $2,
         completed_at = CASE WHEN $2 = TRUE AND completed = FALSE THEN CURRENT_TIMESTAMP ELSE completed_at END
     WHERE user_id = $3 AND course_id = $4
     RETURNING *`,
    [progress, completed, user_id, course_id]
  );
  return result.rows[0] || null;
};

export const deleteEnrollment = async (user_id, course_id) => {
  const result = await query(
    'DELETE FROM enrollments WHERE user_id = $1 AND course_id = $2 RETURNING id',
    [user_id, course_id]
  );
  return result.rows[0] || null;
};