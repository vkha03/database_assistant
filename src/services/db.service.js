// services/dbConnection.service.js
import pool from '../db/index.js';
import Crypto from '../utils/crypto.js';
import normallizeSchema from '../utils/normallizeSchema.js';
import DBModel from '../models/db.model.js';

const ALLOWED_FIELDS = [
    'db_host',
    'db_port',
    'db_name',
    'db_user',
    'db_password',
    'schema_version'
];

const DBService = {
    findAll: async () => {
        const data = await DBModel.findAll();
        return data;
    },

    findById: async (id) => {
        const data = await DBModel.findById(id);

        if (!data) {
            throw Object.assign(
                new Error('Không tìm thấy kết nối DB'),
                { statusCode: 404 }
            );
        }

        return data;
    },

    findByActive: async (userId) => {
        const data = await DBModel.findByActive(userId);

        if (!data) {
            throw Object.assign(
                new Error('Không tìm thấy kết nối DB'),
                { statusCode: 404 }
            );
        }

        return data;
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

        await DBModel.create(user_id, db_host, db_port, db_name, db_user, encryptedPassword, schema_version);

        if (!user_id || !db_host || !db_port || !db_name || !db_user || !db_password) {
            throw Object.assign(
                new Error('Thiếu dữ liệu bắt buộc'),
                { statusCode: 400 }
            );
        }

        const encryptedPassword = Crypto.encryptPassword(db_password);

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

    update: async (id, updates) => {
        if (!id) {
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

        const values = [...Object.values(filtered), id];

        const result = await DBModel.update(fields, values);

        if (result.affectedRows === 0) {
            throw Object.assign(
                new Error('Không tìm thấy kết nối DB'),
                { statusCode: 404 }
            );
        }

        return true;
    },

    delete: async (id) => {
        const result = await DBModel.delete(id);

        if (result.affectedRows === 0) {
            throw Object.assign(
                new Error('Không tìm thấy kết nối DB'),
                { statusCode: 404 }
            );
        }

        return true;
    },

    testConnection: async (userId) => {
        const dbInfo = await DBConnectionService.findByActive(userId);

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
            await connection.execute('SELECT 1');
            const schema = await DBConnectionService.getSchema(userId);
            await DBModel.updateSchema(schema, userId);

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
        const dbInfo = await DBConnectionService.findByActive(userId);

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
            const result = await DBModel.getSchema(dbInfo.db_name)

            const schema = normallizeSchema(result);

            return schema;
        } finally {
            await connection.end();
        }
    },

    active: async (userId, id) => {
        await DBModel.unActive(userId);

        const active = await DBModel.active(userId, id);
        if (active.affectedRows === 0) {
            throw Object.assign(
                new Error('Không tìm thấy kết nối DB'),
                { statusCode: 404 }
            );
        }

        return true;
    }
};

export default DBService;
