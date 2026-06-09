import { query } from '../config/db.js';

export const createLesson = async ({ module_id, title, content, video_url, video_duration, position, is_published = true }) => {
  const result = await query(
    `INSERT INTO lessons (module_id, title, content, video_url, video_duration, position, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [module_id, title, content || null, video_url || null, video_duration || 0, position, is_published]
  );
  return result.rows[0];
};

export const getLessonById = async (id) => {
  const result = await query(
    `SELECT l.*, m.title as module_title, m.course_id, c.title as course_title, c.instructor_id
     FROM lessons l
     JOIN modules m ON l.module_id = m.id
     JOIN courses c ON m.course_id = c.id
     WHERE l.id = $1 AND c.is_deleted = FALSE`,
    [id]
  );
  return result.rows[0] || null;
};

export const getLessonsByModule = async (module_id, includeUnpublished = false) => {
  const conditions = ['l.module_id = $1'];
  if (!includeUnpublished) conditions.push('l.is_published = TRUE');

  const result = await query(
    `SELECT l.*, COUNT(DISTINCT q.id) as quiz_count, COUNT(DISTINCT a.id) as assignment_count
     FROM lessons l
     LEFT JOIN quizzes q ON l.id = q.lesson_id
     LEFT JOIN assignments a ON l.id = a.lesson_id
     WHERE ${conditions.join(' AND ')}
     GROUP BY l.id
     ORDER BY l.position`,
    [module_id]
  );
  return result.rows;
};

export const updateLesson = async (id, updates) => {
  const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`);
  const values = [...Object.values(updates), id];

  const result = await query(
    `UPDATE lessons SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

export const deleteLesson = async (id) => {
  const result = await query(
    'DELETE FROM lessons WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
};

export const reorderLessons = async (module_id, positions) => {
  const client = await (await import('../config/db.js')).getClient();
  try {
    await client.query('BEGIN');
    for (const { id, position } of positions) {
      await client.query(
        'UPDATE lessons SET position = $1 WHERE id = $2 AND module_id = $3',
        [position, id, module_id]
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

export const getNextLessonPosition = async (module_id) => {
  const result = await query(
    'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM lessons WHERE module_id = $1',
    [module_id]
  );
  return parseInt(result.rows[0].next_position);
};