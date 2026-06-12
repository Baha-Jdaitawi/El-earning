import { query } from '../config/db.js';

export const createMessage = async ({ sender_id, course_id, receiver_id, content }) => {
  const result = await query(
    `INSERT INTO messages (sender_id, course_id, receiver_id, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [sender_id, course_id || null, receiver_id || null, content]
  );
  return result.rows[0];
};

export const getCourseMessages = async (course_id, { limit = 50 } = {}) => {
  const result = await query(
    `SELECT m.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.course_id = $1
     ORDER BY m.created_at ASC
     LIMIT $2`,
    [course_id, limit]
  );
  return result.rows;
};

export const getDirectMessages = async (user1_id, user2_id, { limit = 50 } = {}) => {
  const result = await query(
    `SELECT m.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.course_id IS NULL
       AND (
         (m.sender_id = $1 AND m.receiver_id = $2)
         OR
         (m.sender_id = $2 AND m.receiver_id = $1)
       )
     ORDER BY m.created_at ASC
     LIMIT $3`,
    [user1_id, user2_id, limit]
  );
  return result.rows;
};

export const markDirectMessagesAsRead = async (sender_id, receiver_id) => {
  await query(
    `UPDATE messages SET is_read = TRUE
     WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
    [sender_id, receiver_id]
  );
};

export const getUnreadCount = async (user_id) => {
  const result = await query(
    `SELECT COUNT(*) as count FROM messages
     WHERE receiver_id = $1 AND is_read = FALSE AND course_id IS NULL`,
    [user_id]
  );
  return parseInt(result.rows[0].count);
};

export const getDirectMessageContacts = async (user_id) => {
  const result = await query(
    `SELECT
       contact_id,
       u.name as contact_name,
       u.avatar as contact_avatar,
       u.role as contact_role,
       last_message_at,
       last_message,
       unread_count
     FROM (
       SELECT
         CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END as contact_id,
         MAX(m.created_at) as last_message_at,
         (array_agg(m.content ORDER BY m.created_at DESC))[1] as last_message,
         COUNT(CASE WHEN m.receiver_id = $1 AND m.is_read = FALSE THEN 1 END) as unread_count
       FROM messages m
       WHERE (m.sender_id = $1 OR m.receiver_id = $1) AND m.course_id IS NULL
       GROUP BY contact_id
     ) contacts
     JOIN users u ON u.id = contacts.contact_id
     ORDER BY last_message_at DESC`,
    [user_id]
  );
  return result.rows;
};

export const deleteMessage = async (id) => {
  const result = await query(
    'DELETE FROM messages WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
};

export const clearCourseChat = async (course_id) => {
  await query('DELETE FROM messages WHERE course_id = $1', [course_id]);
};