// services/dbConnection.service.js
import pool from '../db/index.js';
import Crypto from '../utils/crypto.js';
import mysql from 'mysql2';
import normallizeSchema from '../utils/normallizeSchema.js';

const ALLOWED_FIELDS = [
    'db_host',
    'db_port',
    'db_name',
    'db_user',
    'db_password',
    'schema_version'
];

const DBConnectionService = {
    findAll: async () => {
        const [rows] = await pool.query(
            'SELECT id, user_id, db_host, db_port, db_name, db_user, schema_version, created_at, updated_at FROM user_databases'
        );
        return rows;
    },

    findById: async (userId) => {
        const [rows] = await pool.query(
            'SELECT * FROM user_databases WHERE user_id = ?',
            [userId]
        );

        if (!rows[0]) {
            throw Object.assign(
                new Error('Không tìm thấy kết nối DB'),
                { statusCode: 404 }
            );
        }

        return rows[0];
    },

    create: async (data) => {
        const {
            user_id,
            db_host,
            db_port,
            db_name,
            db_user,
            db_password,
            schema_version
        } = data;

        if (!user_id || !db_host || !db_port || !db_name || !db_user || !db_password) {
            throw Object.assign(
                new Error('Thiếu dữ liệu bắt buộc'),
                { statusCode: 400 }
            );
        }

        const encryptedPassword = Crypto.encryptPassword(db_password);

        const [result] = await pool.query(
            `INSERT INTO user_databases
       (user_id, db_host, db_port, db_name, db_user, db_password_encrypted, schema_version)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                db_host,
                db_port,
                db_name,
                db_user,
                encryptedPassword,
                schema_version || null
            ]
        );

        return {
            id: result.insertId,
            user_id,
            db_host,
            db_port,
            db_name,
            db_user,
            schema_version
        };
    },

    update: async (userId, updates) => {
        if (!userId) {
            throw Object.assign(new Error('ID không hợp lệ'), { statusCode: 400 });
        }

        const filtered = {};

        for (const key of Object.keys(updates)) {
            if (!ALLOWED_FIELDS.includes(key)) continue;

            if (key === 'db_password') {
                filtered.db_password_encrypted =
                    Crypto.encryptPassword(updates.db_password);
            } else {
                filtered[key] = updates[key];
            }
        }

        if (Object.keys(filtered).length === 0) {
            throw Object.assign(
                new Error('Không có trường hợp lệ để cập nhật'),
                { statusCode: 400 }
            );
        }

        const fields = Object.keys(filtered)
            .map(k => `${k} = ?`)
            .join(', ');

        const values = [...Object.values(filtered), userId];

        const [result] = await pool.query(
            `UPDATE user_databases SET ${fields} WHERE user_id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            throw Object.assign(
                new Error('Không tìm thấy kết nối DB'),
                { statusCode: 404 }
            );
        }

        return true;
    },

    delete: async (id) => {
        const [result] = await pool.query(
            'DELETE FROM user_databases WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw Object.assign(
                new Error('Không tìm thấy kết nối DB'),
                { statusCode: 404 }
            );
        }

        return true;
    },

    testConnection: async (userId) => {
        const dbInfo = await DBConnectionService.findById(userId);

        const password = dbInfo.db_password_encrypted ? Crypto.decryptPassword(dbInfo.db_password_encrypted) : '';

        const connection = mysql
            .createConnection({
                host: dbInfo.db_host,
                user: dbInfo.db_user,
                password,
                database: dbInfo.db_name,
                port: dbInfo.db_port,
                connectTimeout: 5000
            }).promise();

        try {
            await connection.query('SELECT 1');

            const schema = await DBConnectionService.getSchema(userId);
            await pool.query(
                `UPDATE user_databases
                SET schema_json = ?
                WHERE user_id = ?`,
                [JSON.stringify(schema), userId]
            );

            return true;
        } catch (err) {
            throw Object.assign(
                new Error('Không thể kết nối tới database'),
                { statusCode: 400 }
            );
        } finally {
            await connection.end();
        }
    },

    getSchema: async (userId) => {
        // 1. Lấy config DB của user
        const dbInfo = await DBConnectionService.findById(userId);

        const password = dbInfo.db_password_encrypted ? Crypto.decryptPassword(dbInfo.db_password_encrypted) : '';

        const connection = mysql
            .createConnection({
                host: dbInfo.db_host,
                user: dbInfo.db_user,
                password,
                database: dbInfo.db_name,
                port: dbInfo.db_port,
                connectTimeout: 5000
            }).promise();

        try {
            // 3. Lấy schema
            const [rows] = await connection.query(
                `
       SELECT 
    c.TABLE_NAME, 
    c.COLUMN_NAME, 
    c.COLUMN_TYPE, 
    c.COLUMN_KEY, 
    c.COLUMN_COMMENT,
    k.REFERENCED_TABLE_NAME, 
    k.REFERENCED_COLUMN_NAME
FROM information_schema.COLUMNS c
LEFT JOIN information_schema.KEY_COLUMN_USAGE k 
    ON c.TABLE_SCHEMA = k.TABLE_SCHEMA 
    AND c.TABLE_NAME = k.TABLE_NAME 
    AND c.COLUMN_NAME = k.COLUMN_NAME
WHERE c.TABLE_SCHEMA = '${dbInfo.db_name}'
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;
        `,
                [dbInfo.db_name]
            );

            const schema = normallizeSchema(rows);

            return schema;
        } finally {
            await connection.end();
        }
    }
};

export default DBConnectionService;
