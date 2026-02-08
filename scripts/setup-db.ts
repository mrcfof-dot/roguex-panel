import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function setup() {
    console.log('🚀 Iniciando configuração do banco de dados no Aiven...');

    const connectionConfig = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        ssl: {
            rejectUnauthorized: false
        },
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(connectionConfig);
        console.log('✅ Conectado ao MySQL com sucesso!');

        const sqlPath = path.join(process.cwd(), 'database.sql');
        let sql = fs.readFileSync(sqlPath, 'utf8');

        // Remove as linhas de CREATE DATABASE e USE pois no Aiven já estamos no banco certo
        sql = sql.replace(/CREATE DATABASE IF NOT EXISTS.*;/gi, '');
        sql = sql.replace(/USE.*;/gi, '');

        console.log('⏳ Executando scripts do banco de dados...');
        await connection.query(sql);

        console.log('✨ Banco de dados configurado com sucesso no Aiven!');
        await connection.end();
    } catch (error) {
        console.error('❌ Erro ao configurar banco de dados:', error);
        process.exit(1);
    }
}

setup();
