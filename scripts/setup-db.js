
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    console.log('🔄 Starting database setup...');

    const config = {
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        multipleStatements: true,
    };

    try {
        // 1. Connect without database selected
        console.log('🔌 Connecting to MySQL server...');
        const connection = await mysql.createConnection(config);

        // 2. Read SQL file
        console.log('📖 Reading database.sql...');
        const sqlPath = path.join(__dirname, '..', 'database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // 3. Execute SQL
        console.log('⚡ Executing SQL commands...');
        await connection.query(sql);

        console.log('✅ Database setup completed successfully!');
        console.log('✅ Database "roguex_panel" created and tables initialized.');

        await connection.end();
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

setupDatabase();
