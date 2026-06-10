import { query } from '../config/db.js';

export const createReview = async ({ course_id, student_id, rating, comment }) => {
  const result = await query(
    `INSERT INTO reviews (course_id, student_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [course_id, student_id, rating, comment || null]
  );
  return result.rows[0];
};

export const getReviewByCourseAndStudent = async (course_id, student_id) => {
  const result = await query(
    'SELECT * FROM reviews WHERE course_id = $1 AND student_id = $2',
    [course_id, student_id]
  );
  return result.rows[0] || null;
};

export const getReviewsByCourse = async (course_id, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;

  const countResult = await query(
    'SELECT COUNT(*) FROM reviews WHERE course_id = $1',
    [course_id]
  );
  const total = parseInt(countResult.rows[0].count);

  const result = await query(
    `SELECT r.*, u.name as student_name, u.avatar as student_avatar
     FROM reviews r
     JOIN users u ON r.student_id = u.id
     WHERE r.course_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [course_id, limit, offset]
  );

  return { reviews: result.rows, total };
};

export const getCourseRatingStats = async (course_id) => {
  const result = await query(
    `SELECT
       COUNT(*) as total_reviews,
       ROUND(AVG(rating)::numeric, 1) as average_rating,
       COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
       COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
       COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
       COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
       COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
     FROM reviews
     WHERE course_id = $1`,
    [course_id]
  );
  return result.rows[0];
};

export const updateReview = async (id, { rating, comment }) => {
  const result = await query(
    `UPDATE reviews SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 RETURNING *`,
    [rating, comment || null, id]
  );
  return result.rows[0] || null;
};

export const deleteReview = async (id) => {
  const result = await query(
    'DELETE FROM reviews WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
};