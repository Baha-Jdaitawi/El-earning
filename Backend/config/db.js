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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err);
  process.exit(-1);
});

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('  Database connected at:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('  Database connection failed:', err.message);
    return false;
  }
};

export const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error('[DB Error]', err.message);
    throw err;
  }
};

export const getClient = async () => {
  return await pool.connect();
};

export const closePool = async () => {
  await pool.end();
  console.log('Database pool closed');
};

process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

export default pool;