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
        const tables = ['license_keys', 'hwids', 'auth_logs', 'settings'];
        for (const table of tables) {
            try {
                const [rows] = await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
                console.log(`Table ${table} exists.`);
            } catch (err) {
                console.error(`Table ${table} is missing or inaccessible:`, err.message);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

test();
