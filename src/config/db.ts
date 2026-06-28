import mysql, { ResultSetHeader } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'mockiq_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
});

type Param = string | number | boolean | null;

export const query = async <T = unknown>(sql: string, params: Param[] = []): Promise<T[]> => {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
};

export const execute = async (sql: string, params: Param[] = []): Promise<ResultSetHeader> => {
  const [result] = await pool.query(sql, params);
  return result as ResultSetHeader;
};

export const testConnection = async (): Promise<void> => {
  try {
    const conn = await pool.getConnection();
    console.log('✅  MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌  MySQL connection failed:', err);
    process.exit(1);
  }
};

export default pool;
