import { query } from '../config/db.js';

export const markLessonComplete = async (user_id, lesson_id, time_spent = 0) => {
  const result = await query(
    `INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, time_spent)
     VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP, $3)
     ON CONFLICT (user_id, lesson_id)
     DO UPDATE SET
       completed = TRUE,
       completed_at = CURRENT_TIMESTAMP,
       time_spent = GREATEST(lesson_progress.time_spent, $3),
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [user_id, lesson_id, time_spent]
  );
  return result.rows[0];
};

export const getLessonProgress = async (user_id, lesson_id) => {
  const result = await query(
    'SELECT * FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2',
    [user_id, lesson_id]
  );
  return result.rows[0] || null;
};

export const getCourseProgress = async (user_id, course_id) => {
  const result = await query(
    `WITH total AS (
       SELECT COUNT(*) as total_lessons
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE m.course_id = $2 AND l.is_published = TRUE
     ),
     completed AS (
       SELECT COUNT(*) as completed_lessons
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       WHERE lp.user_id = $1 AND m.course_id = $2 AND lp.completed = TRUE
     )
     SELECT
       total.total_lessons,
       completed.completed_lessons,
       CASE WHEN total.total_lessons = 0 THEN 0
         ELSE ROUND(completed.completed_lessons::numeric / total.total_lessons::numeric * 100, 2)
       END as percentage
     FROM total, completed`,
    [user_id, course_id]
  );
  return result.rows[0];
};

export const getUserCourseProgressDetail = async (user_id, course_id) => {
  const result = await query(
    `SELECT l.id as lesson_id, l.title as lesson_title, l.position,
            m.title as module_title, m.position as module_position,
            lp.completed, lp.completed_at, lp.time_spent
     FROM lessons l
     JOIN modules m ON l.module_id = m.id
     LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = $1
     WHERE m.course_id = $2 AND l.is_published = TRUE
     ORDER BY m.position, l.position`,
    [user_id, course_id]
  );
  return result.rows;
};

export const getUserLearningStats = async (user_id) => {
  const result = await query(
    `SELECT
       COUNT(DISTINCT e.course_id) as total_enrolled,
       COUNT(DISTINCT CASE WHEN e.completed = TRUE THEN e.course_id END) as total_completed,
       COUNT(DISTINCT lp.lesson_id) as lessons_completed,
       COALESCE(SUM(lp.time_spent), 0) as total_time_spent
     FROM enrollments e
     LEFT JOIN lesson_progress lp ON e.user_id = lp.user_id AND lp.completed = TRUE
     WHERE e.user_id = $1`,
    [user_id]
  );
  return result.rows[0];
};

export const getRecentActivity = async (user_id, limit = 10) => {
  const result = await query(
    `SELECT lp.completed_at, l.title as lesson_title,
            m.title as module_title, c.title as course_title, c.id as course_id
     FROM lesson_progress lp
     JOIN lessons l ON lp.lesson_id = l.id
     JOIN modules m ON l.module_id = m.id
     JOIN courses c ON m.course_id = c.id
     WHERE lp.user_id = $1 AND lp.completed = TRUE
     ORDER BY lp.completed_at DESC
     LIMIT $2`,
    [user_id, limit]
  );
  return result.rows;
};