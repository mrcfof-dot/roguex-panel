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

        console.log('Altering license_keys for delayed activation...');

        const [columns] = await pool.query('DESCRIBE license_keys');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('duration_seconds')) {
            console.log('Adding duration_seconds...');
            await pool.query('ALTER TABLE license_keys ADD COLUMN duration_seconds BIGINT AFTER expires_at');
        }

        if (!columnNames.includes('activated_at')) {
            console.log('Adding activated_at...');
            await pool.query('ALTER TABLE license_keys ADD COLUMN activated_at DATETIME AFTER duration_seconds');
        }

        // Allow expires_at to be NULL
        console.log('Updating expires_at to allow NULL...');
        await pool.query('ALTER TABLE license_keys MODIFY COLUMN expires_at DATETIME NULL');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
