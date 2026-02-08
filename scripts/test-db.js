require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
    try {
        const pool = mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'roguex_panel',
        });
        const [rows] = await pool.query('SELECT 1');
        console.log('Database connection successful:', rows);
        process.exit(0);
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

test();
