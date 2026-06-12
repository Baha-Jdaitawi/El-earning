import { query } from '../config/db.js';

export const createAnnouncement = async ({ course_id, instructor_id, title, content }) => {
  const result = await query(
    `INSERT INTO announcements (course_id, instructor_id, title, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [course_id, instructor_id, title, content]
  );
  return result.rows[0];
};

export const getAnnouncementsByCourse = async (course_id) => {
  const result = await query(
    `SELECT a.*, u.name as instructor_name, u.avatar as instructor_avatar
     FROM announcements a
     JOIN users u ON a.instructor_id = u.id
     WHERE a.course_id = $1
     ORDER BY a.created_at DESC`,
    [course_id]
  );
  return result.rows;
};

export const getAnnouncementById = async (id) => {
  const result = await query(
    `SELECT a.*, u.name as instructor_name
     FROM announcements a
     JOIN users u ON a.instructor_id = u.id
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

export const updateAnnouncement = async (id, { title, content }) => {
  const result = await query(
    `UPDATE announcements SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 RETURNING *`,
    [title, content, id]
  );
  return result.rows[0] || null;
};

export const deleteAnnouncement = async (id) => {
  await query('DELETE FROM announcements WHERE id = $1', [id]);
};