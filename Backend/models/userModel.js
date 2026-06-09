import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createUser = async ({ name, email, password, google_id, avatar, role = 'student' }) => {
  const hashed = password ? await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12) : null;

  const result = await query(
    `INSERT INTO users (name, email, password, google_id, avatar, role, email_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, avatar, role, created_at`,
    [name, email, hashed, google_id || null, avatar || null, role, google_id ? true : false]
  );

  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await query(
    'SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE',
    [email]
  );
  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const result = await query(
    'SELECT id, name, email, avatar, role, email_verified, last_login, created_at FROM users WHERE id = $1 AND is_deleted = FALSE',
    [id]
  );
  return result.rows[0] || null;
};

export const findUserByGoogleId = async (googleId) => {
  const result = await query(
    'SELECT * FROM users WHERE google_id = $1 AND is_deleted = FALSE',
    [googleId]
  );
  return result.rows[0] || null;
};

export const updateUser = async (id, updates) => {
  const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`);
  const values = [...Object.values(updates), id];

  const result = await query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length} AND is_deleted = FALSE
     RETURNING id, name, email, avatar, role, email_verified, updated_at`,
    values
  );
  return result.rows[0] || null;
};

export const updatePassword = async (id, newPassword) => {
  const hashed = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);
  await query(
    'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [hashed, id]
  );
};

export const updateLastLogin = async (id) => {
  await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [id]);
};

export const deleteUser = async (id) => {
  const result = await query(
    'UPDATE users SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
};

export const getAllUsers = async ({ page = 1, limit = 10, role, search }) => {
  const offset = (page - 1) * limit;
  const conditions = ['is_deleted = FALSE'];
  const values = [];
  let i = 1;

  if (role) {
    conditions.push(`role = $${i++}`);
    values.push(role);
  }

  if (search) {
    conditions.push(`(LOWER(name) LIKE $${i} OR LOWER(email) LIKE $${i})`);
    values.push(`%${search.toLowerCase()}%`);
    i++;
  }

  const where = conditions.join(' AND ');

  const countResult = await query(`SELECT COUNT(*) FROM users WHERE ${where}`, values);
  const total = parseInt(countResult.rows[0].count);

  const result = await query(
    `SELECT id, name, email, avatar, role, email_verified, last_login, created_at
     FROM users WHERE ${where}
     ORDER BY created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...values, limit, offset]
  );

  return { users: result.rows, total };
};

export const emailExists = async (email, excludeId = null) => {
  let text = 'SELECT id FROM users WHERE email = $1 AND is_deleted = FALSE';
  const params = [email];
  if (excludeId) {
    text += ' AND id != $2';
    params.push(excludeId);
  }
  const result = await query(text, params);
  return result.rows.length > 0;
};