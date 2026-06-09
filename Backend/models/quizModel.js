import { query, getClient } from '../config/db.js';

export const createQuiz = async ({ lesson_id, question, answer, options, quiz_type = 'text', points = 1 }) => {
  const result = await query(
    `INSERT INTO quizzes (lesson_id, question, answer, options, quiz_type, points)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [lesson_id, question, answer, options ? JSON.stringify(options) : null, quiz_type, points]
  );
  return result.rows[0];
};

export const getQuizById = async (id) => {
  const result = await query(
    `SELECT q.*, l.title as lesson_title, m.course_id, c.instructor_id
     FROM quizzes q
     JOIN lessons l ON q.lesson_id = l.id
     JOIN modules m ON l.module_id = m.id
     JOIN courses c ON m.course_id = c.id
     WHERE q.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

export const getQuizzesByLesson = async (lesson_id) => {
  const result = await query(
    'SELECT * FROM quizzes WHERE lesson_id = $1 ORDER BY id',
    [lesson_id]
  );
  return result.rows;
};

export const getQuizQuestionsForStudent = async (lesson_id) => {
  const result = await query(
    'SELECT id, question, options, quiz_type, points FROM quizzes WHERE lesson_id = $1 ORDER BY id',
    [lesson_id]
  );
  return result.rows;
};

export const updateQuiz = async (id, updates) => {
  const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`);
  const values = [...Object.values(updates), id];

  const result = await query(
    `UPDATE quizzes SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

export const deleteQuiz = async (id) => {
  const result = await query('DELETE FROM quizzes WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
};

export const submitQuizAnswers = async (lesson_id, answers) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows: quizzes } = await client.query(
      'SELECT id, question, answer, quiz_type, points FROM quizzes WHERE lesson_id = $1 ORDER BY id',
      [lesson_id]
    );

    let totalPoints = 0;
    let earnedPoints = 0;
    const results = [];

    for (const quiz of quizzes) {
      const userAnswer = answers[quiz.id];
      totalPoints += quiz.points;
      let isCorrect = false;

      if (userAnswer !== undefined && userAnswer !== null) {
        isCorrect = userAnswer.toString().toLowerCase().trim() === quiz.answer.toString().toLowerCase().trim();
      }

      if (isCorrect) earnedPoints += quiz.points;

      results.push({
        quizId: quiz.id,
        question: quiz.question,
        userAnswer,
        correctAnswer: quiz.answer,
        isCorrect,
        points: isCorrect ? quiz.points : 0,
        maxPoints: quiz.points,
      });
    }

    await client.query('COMMIT');

    return {
      totalQuestions: quizzes.length,
      totalPoints,
      earnedPoints,
      score: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
      results,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const bulkCreateQuizzes = async (lesson_id, quizzes) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const created = [];
    for (const q of quizzes) {
      const result = await client.query(
        `INSERT INTO quizzes (lesson_id, question, answer, options, quiz_type, points)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [lesson_id, q.question, q.answer, q.options ? JSON.stringify(q.options) : null, q.quiz_type || 'text', q.points || 1]
      );
      created.push(result.rows[0]);
    }
    await client.query('COMMIT');
    return created;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};