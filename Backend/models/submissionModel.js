import { query, getClient } from '../config/db.js';

export const createSubmission = async ({ assignment_id, student_id, content, file_path }) => {
  const assignmentResult = await query(
    'SELECT due_date, allow_late_submission FROM assignments WHERE id = $1',
    [assignment_id]
  );

  if (assignmentResult.rows.length === 0) throw new Error('Assignment not found');

  const { due_date, allow_late_submission } = assignmentResult.rows[0];
  const is_late = due_date && new Date() > new Date(due_date);

  if (is_late && !allow_late_submission) {
    throw new Error('Late submissions are not allowed for this assignment');
  }

  const result = await query(
    `INSERT INTO submissions (assignment_id, student_id, content, file_path, is_late)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [assignment_id, student_id, content || null, file_path || null, is_late]
  );
  return result.rows[0];
};

export const getSubmissionById = async (id) => {
  const result = await query(
    `SELECT s.*, a.title as assignment_title, a.max_points, a.due_date,
            u.name as student_name, u.email as student_email,
            g.name as grader_name
     FROM submissions s
     JOIN assignments a ON s.assignment_id = a.id
     JOIN users u ON s.student_id = u.id
     LEFT JOIN users g ON s.graded_by = g.id
     WHERE s.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

export const getSubmissionByAssignmentAndStudent = async (assignment_id, student_id) => {
  const result = await query(
    'SELECT * FROM submissions WHERE assignment_id = $1 AND student_id = $2',
    [assignment_id, student_id]
  );
  return result.rows[0] || null;
};

export const getSubmissionsByAssignment = async (assignment_id, { page = 1, limit = 10, graded } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = ['s.assignment_id = $1'];
  const values = [assignment_id];
  let i = 2;

  if (graded === true) { conditions.push('s.grade IS NOT NULL'); }
  if (graded === false) { conditions.push('s.grade IS NULL'); }

  const where = conditions.join(' AND ');

  const countResult = await query(`SELECT COUNT(*) FROM submissions s WHERE ${where}`, values);
  const total = parseInt(countResult.rows[0].count);

  const result = await query(
    `SELECT s.*, u.name as student_name, u.email as student_email, u.avatar as student_avatar
     FROM submissions s
     JOIN users u ON s.student_id = u.id
     WHERE ${where}
     ORDER BY s.submitted_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...values, limit, offset]
  );

  return { submissions: result.rows, total };
};

export const getSubmissionsByStudent = async (student_id, { page = 1, limit = 10, course_id } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = ['s.student_id = $1'];
  const values = [student_id];
  let i = 2;

  if (course_id) {
    conditions.push(`c.id = $${i++}`);
    values.push(course_id);
  }

  const where = conditions.join(' AND ');

  const result = await query(
    `SELECT s.*, a.title as assignment_title, a.max_points, a.due_date,
            l.title as lesson_title, c.title as course_title
     FROM submissions s
     JOIN assignments a ON s.assignment_id = a.id
     JOIN lessons l ON a.lesson_id = l.id
     JOIN modules m ON l.module_id = m.id
     JOIN courses c ON m.course_id = c.id
     WHERE ${where}
     ORDER BY s.submitted_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...values, limit, offset]
  );

  return result.rows;
};

export const gradeSubmission = async (id, { grade, feedback }, graded_by) => {
  const result = await query(
    `UPDATE submissions
     SET grade = $1, feedback = $2, graded_at = CURRENT_TIMESTAMP, graded_by = $3
     WHERE id = $4
     RETURNING *`,
    [grade, feedback || null, graded_by, id]
  );
  return result.rows[0] || null;
};

export const updateSubmission = async (id, { content, file_path }) => {
  const result = await query(
    `UPDATE submissions SET content = $1, file_path = $2, submitted_at = CURRENT_TIMESTAMP
     WHERE id = $3 RETURNING *`,
    [content || null, file_path || null, id]
  );
  return result.rows[0] || null;
};

export const getPendingSubmissions = async (instructor_id, { page = 1, limit = 10, course_id } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = ['c.instructor_id = $1', 's.grade IS NULL'];
  const values = [instructor_id];
  let i = 2;

  if (course_id) {
    conditions.push(`c.id = $${i++}`);
    values.push(course_id);
  }

  const result = await query(
    `SELECT s.*, a.title as assignment_title, a.max_points,
            u.name as student_name, u.email as student_email,
            c.title as course_title
     FROM submissions s
     JOIN assignments a ON s.assignment_id = a.id
     JOIN users u ON s.student_id = u.id
     JOIN lessons l ON a.lesson_id = l.id
     JOIN modules m ON l.module_id = m.id
     JOIN courses c ON m.course_id = c.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY s.submitted_at ASC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...values, limit, offset]
  );

  return result.rows;
};

export const getGradedSubmissionsByInstructor = async (instructor_id, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;

  const result = await query(
    `SELECT s.*, a.title as assignment_title, a.max_points,
            u.name as student_name, u.email as student_email,
            c.title as course_title
     FROM submissions s
     JOIN assignments a ON s.assignment_id = a.id
     JOIN users u ON s.student_id = u.id
     JOIN lessons l ON a.lesson_id = l.id
     JOIN modules m ON l.module_id = m.id
     JOIN courses c ON m.course_id = c.id
     WHERE c.instructor_id = $1 AND s.grade IS NOT NULL
     ORDER BY s.graded_at DESC
     LIMIT $2 OFFSET $3`,
    [instructor_id, limit, offset]
  );

  return result.rows;
};

export const bulkGradeSubmissions = async (grades, graded_by) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const results = [];
    for (const { id, grade, feedback } of grades) {
      const result = await client.query(
        `UPDATE submissions SET grade = $1, feedback = $2, graded_at = CURRENT_TIMESTAMP, graded_by = $3
         WHERE id = $4 RETURNING *`,
        [grade, feedback || null, graded_by, id]
      );
      if (result.rows[0]) results.push(result.rows[0]);
    }
    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};