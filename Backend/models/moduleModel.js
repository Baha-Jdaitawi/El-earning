import { query } from '../config/db.js';

export const createModule = async ({ course_id, title, description, position, is_published = true }) => {
  const result = await query(
    `INSERT INTO modules (course_id, title, description, position, is_published)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [course_id, title, description || null, position, is_published]
  );
  return result.rows[0];
};

export const getModuleById = async (id) => {
  const result = await query(
    `SELECT m.*, c.title as course_title, c.instructor_id
     FROM modules m
     JOIN courses c ON m.course_id = c.id
     WHERE m.id = $1 AND c.is_deleted = FALSE`,
    [id]
  );
  return result.rows[0] || null;
};

export const getModulesByCourse = async (course_id, includeUnpublished = false) => {
  const conditions = ['m.course_id = $1'];
  if (!includeUnpublished) conditions.push('m.is_published = TRUE');

  const result = await query(
    `SELECT m.*, COUNT(DISTINCT l.id) as lesson_count,
            SUM(COALESCE(l.video_duration, 0)) as total_duration
     FROM modules m
     LEFT JOIN lessons l ON m.id = l.module_id
     WHERE ${conditions.join(' AND ')}
     GROUP BY m.id
     ORDER BY m.position`,
    [course_id]
  );
  return result.rows;
};

export const updateModule = async (id, updates) => {
  const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`);
  const values = [...Object.values(updates), id];

  const result = await query(
    `UPDATE modules SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

export const deleteModule = async (id) => {
  const client = await (await import('../config/db.js')).getClient();
  try {
    await client.query('BEGIN');

    // Get all lessons in this module
    const lessonsRes = await client.query('SELECT id FROM lessons WHERE module_id = $1', [id]);
    const lessonIds = lessonsRes.rows.map((r) => r.id);

    if (lessonIds.length > 0) {
      // Delete quiz attempts, quizzes, assignment submissions, assignments, progress for each lesson
      await client.query('DELETE FROM quiz_attempts WHERE lesson_id = ANY($1)', [lessonIds]);
      await client.query('DELETE FROM quizzes WHERE lesson_id = ANY($1)', [lessonIds]);
      await client.query('DELETE FROM submissions WHERE assignment_id IN (SELECT id FROM assignments WHERE lesson_id = ANY($1))', [lessonIds]);
      await client.query('DELETE FROM assignments WHERE lesson_id = ANY($1)', [lessonIds]);
      await client.query('DELETE FROM progress WHERE lesson_id = ANY($1)', [lessonIds]);
      await client.query('DELETE FROM lessons WHERE module_id = $1', [id]);
    }

    // Delete the module
    const result = await client.query('DELETE FROM modules WHERE id = $1 RETURNING id', [id]);
    await client.query('COMMIT');
    return result.rows[0] || null;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const reorderModules = async (course_id, positions) => {
  const client = await (await import('../config/db.js')).getClient();
  try {
    await client.query('BEGIN');
    for (const { id, position } of positions) {
      await client.query(
        'UPDATE modules SET position = $1 WHERE id = $2 AND course_id = $3',
        [position, id, course_id]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getNextModulePosition = async (course_id) => {
  const result = await query(
    'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM modules WHERE course_id = $1',
    [course_id]
  );
  return parseInt(result.rows[0].next_position);
};

export const moduleTitleExistsInCourse = async (title, course_id, excludeId = null) => {
  let text = 'SELECT id FROM modules WHERE LOWER(title) = LOWER($1) AND course_id = $2';
  const params = [title, course_id];
  if (excludeId) {
    text += ' AND id != $3';
    params.push(excludeId);
  }
  const result = await query(text, params);
  return result.rows.length > 0;
};