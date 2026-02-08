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

        console.log('Checking columns for hwids...');
        const [hwidColumns] = await pool.query('DESCRIBE hwids');
        const hwidColumnNames = hwidColumns.map(c => c.Field);

        if (!hwidColumnNames.includes('last_seen_at')) {
            console.log('Adding last_seen_at to hwids...');
            await pool.query('ALTER TABLE hwids ADD COLUMN last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER registered_at');
        }

        if (!hwidColumnNames.includes('ip_address')) {
            console.log('Adding ip_address to hwids...');
            await pool.query('ALTER TABLE hwids ADD COLUMN ip_address VARCHAR(45) AFTER hwid');
        }

        console.log('Checking columns for license_keys...');
        const [lkColumns] = await pool.query('DESCRIBE license_keys');
        const lkColumnNames = lkColumns.map(c => c.Field);

        if (!lkColumnNames.includes('discord_username')) {
            console.log('Adding discord_username to license_keys...');
            await pool.query('ALTER TABLE license_keys ADD COLUMN discord_username VARCHAR(255) AFTER discord_id');
        }

        if (!lkColumnNames.includes('discord_avatar')) {
            console.log('Adding discord_avatar to license_keys...');
            await pool.query('ALTER TABLE license_keys ADD COLUMN discord_avatar VARCHAR(255) AFTER discord_username');
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
