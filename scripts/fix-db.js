require('dotenv').config();
const mysql = require('mysql2/promise');

async function fix() {
    try {
        const pool = mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'roguex_panel',
        });

        console.log('Creating tables if they are missing...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS license_keys (
                id CHAR(36) PRIMARY KEY,
                \`key\` VARCHAR(255) NOT NULL UNIQUE,
                label VARCHAR(255),
                max_devices INT DEFAULT 1,
                status ENUM('active', 'expired', 'banned') DEFAULT 'active',
                expires_at DATETIME NOT NULL,
                discord_id VARCHAR(255),
                discord_username VARCHAR(255),
                discord_avatar VARCHAR(255),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by CHAR(36)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS hwids (
                id CHAR(36) PRIMARY KEY,
                key_id CHAR(36),
                hwid VARCHAR(255) NOT NULL,
                ip_address VARCHAR(45),
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (key_id) REFERENCES license_keys(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS auth_logs (
                id CHAR(36) PRIMARY KEY,
                key_id CHAR(36),
                event_type VARCHAR(50),
                ip_address VARCHAR(45),
                hwid VARCHAR(255),
                details JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (key_id) REFERENCES license_keys(id) ON DELETE SET NULL
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
                setting_key VARCHAR(255) PRIMARY KEY,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('maintenance_mode', 'false'), ('service_status', 'true'), ('min_version', '1.0.0')");

        console.log('Database fix completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Database fix failed:', err);
        process.exit(1);
    }
}

fix();
