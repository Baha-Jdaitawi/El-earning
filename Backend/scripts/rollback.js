import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const run = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('DROP TABLE IF EXISTS submissions CASCADE');
    await client.query('DROP TABLE IF EXISTS assignments CASCADE');
    await client.query('DROP TABLE IF EXISTS quizzes CASCADE');
    await client.query('DROP TABLE IF EXISTS lesson_progress CASCADE');
    await client.query('DROP TABLE IF EXISTS enrollments CASCADE');
    await client.query('DROP TABLE IF EXISTS lessons CASCADE');
    await client.query('DROP TABLE IF EXISTS modules CASCADE');
    await client.query('DROP TABLE IF EXISTS courses CASCADE');
    await client.query('DROP TABLE IF EXISTS categories CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query('DROP TABLE IF EXISTS migrations CASCADE');

    await client.query('COMMIT');
    console.log(' All tables dropped successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Rollback failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

run();