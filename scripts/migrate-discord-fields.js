require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
    try {
        const pool = mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'roguex_panel',
        });

        console.log('Checking columns for license_keys...');
        const [columns] = await pool.query('DESCRIBE license_keys');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('discord_username')) {
            console.log('Adding discord_username to license_keys...');
            await pool.query('ALTER TABLE license_keys ADD COLUMN discord_username VARCHAR(255) AFTER discord_id');
        }

        if (!columnNames.includes('discord_avatar')) {
            console.log('Adding discord_avatar to license_keys...');
            await pool.query('ALTER TABLE license_keys ADD COLUMN discord_avatar VARCHAR(255) AFTER discord_username');
        }

        console.log('Migration successful.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
