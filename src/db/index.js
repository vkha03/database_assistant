import mysql from 'mysql2/promise';
import dbConfig from '../config/database.js';

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const pool = mysql.createPool({
    host: config.host,
    user: config.username,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
