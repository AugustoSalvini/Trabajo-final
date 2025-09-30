import dotenv from 'dotenv';
import pkg from 'pg';
dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
host: process.env.DB_HOST,
port: Number(process.env.DB_PORT || 5432),
database: process.env.DB_NAME,
user: process.env.DB_USER,
password: process.env.DB_PASS,
});

export async function assertDb() {
const { rows } = await pool.query('SELECT NOW() AS now');
console.log('✅ PostgreSQL OK. NOW =', rows[0].now);
}
