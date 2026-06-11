import { query } from '../config/db.js';

export const createNotification = async ({ user_id, type, title, message, link }) => {
  const result = await query(
    `INSERT INTO notifications (user_id, type, title, message, link)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user_id, type, title, message || null, link || null]
  );
  return result.rows[0];
};

export const getNotifications = async (user_id, { limit = 20 } = {}) => {
  const result = await query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [user_id, limit]
  );
  return result.rows;
};

export const getUnreadNotificationsCount = async (user_id) => {
  const result = await query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
    [user_id]
  );
  return parseInt(result.rows[0].count);
};

export const markNotificationAsRead = async (id, user_id) => {
  const result = await query(
    `UPDATE notifications SET is_read = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, user_id]
  );
  return result.rows[0] || null;
};

export const markAllNotificationsAsRead = async (user_id) => {
  await query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
    [user_id]
  );
};

export const deleteNotification = async (id, user_id) => {
  await query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
    [id, user_id]
  );
};