import { query } from '../config/db.js';

export const createAssignment = async ({ lesson_id, title, description, due_date, max_points = 100, allow_late_submission = true, late_penalty_percent = 10 }) => {
  const result = await query(
    `INSERT INTO assignments (lesson_id, title, description, due_date, max_points, allow_late_submission, late_penalty_percent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [lesson_id, title, description || null, due_date || null, max_points, allow_late_submission, late_penalty_percent]
  );
  return result.rows[0];
};

export const getAssignmentById = async (id) => {
  const result = await query(
    `SELECT a.*, l.title as lesson_title, m.course_id, c.title as course_title, c.instructor_id
     FROM assignments a
     JOIN lessons l ON a.lesson_id = l.id
     JOIN modules m ON l.module_id = m.id
     JOIN courses c ON m.course_id = c.id
     WHERE a.id = $1 AND c.is_deleted = FALSE`,
    [id]
  );
  return result.rows[0] || null;
};

export const getAssignmentsByLesson = async (lesson_id) => {
  const result = await query(
    `SELECT a.*, COUNT(s.id) as submission_count,
            COUNT(s.id) FILTER (WHERE s.grade IS NOT NULL) as graded_count
     FROM assignments a
     LEFT JOIN submissions s ON a.id = s.assignment_id
     WHERE a.lesson_id = $1
     GROUP BY a.id
     ORDER BY a.created_at DESC`,
    [lesson_id]
  );
  return result.rows;
};

export const getAssignmentsByCourse = async (course_id) => {
  const result = await query(
    `SELECT a.*, l.title as lesson_title, m.title as module_title,
            COUNT(s.id) as submission_count,
            COUNT(s.id) FILTER (WHERE s.grade IS NOT NULL) as graded_count
     FROM assignments a
     JOIN lessons l ON a.lesson_id = l.id
     JOIN modules m ON l.module_id = m.id
     LEFT JOIN submissions s ON a.id = s.assignment_id
     WHERE m.course_id = $1
     GROUP BY a.id, l.title, m.title
     ORDER BY m.position, l.position, a.created_at`,
    [course_id]
  );
  return result.rows;
};

export const updateAssignment = async (id, updates) => {
  const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`);
  const values = [...Object.values(updates), id];

  const result = await query(
    `UPDATE assignments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

export const deleteAssignment = async (id) => {
  const check = await query('SELECT COUNT(*) FROM submissions WHERE assignment_id = $1', [id]);
  if (parseInt(check.rows[0].count) > 0) {
    throw new Error('Cannot delete assignment that has submissions');
  }
  const result = await query('DELETE FROM assignments WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
};

export const getUpcomingAssignments = async (user_id, limit = 5) => {
  const result = await query(
    `SELECT a.*, l.title as lesson_title, c.title as course_title,
            CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END as submitted
     FROM assignments a
     JOIN lessons l ON a.lesson_id = l.id
     JOIN modules m ON l.module_id = m.id
     JOIN courses c ON m.course_id = c.id
     JOIN enrollments e ON c.id = e.course_id AND e.user_id = $1
     LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $1
     WHERE a.due_date >= CURRENT_DATE AND s.id IS NULL
     ORDER BY a.due_date ASC
     LIMIT $2`,
    [user_id, limit]
  );
  return result.rows;
};