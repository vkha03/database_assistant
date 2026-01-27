import pool from '../db/index.js';
import bcrypt from 'bcrypt';

const UserService = {
  findAll: async () => {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
  },

  findById: async (id) => {
    if (!id) {
      throw Object.assign(new Error('ID không hợp lệ'), { statusCode: 400 });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );

    if (!rows.length) {
      throw Object.assign(
        new Error('Không tìm thấy người dùng'),
        { statusCode: 404 }
      );
    }

    return rows[0];
  },

  create: async (userData) => {
    const { email, password } = userData;

    if (!email || !password) {
      throw Object.assign(
        new Error('Thiếu dữ liệu bắt buộc'),
        { statusCode: 400 }
      );
    }

    const [rows] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      throw Object.assign(
        new Error('Email đã tồn tại'),
        { statusCode: 409 }
      )
    };

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );

    return {
      id: result.insertId,
      email
    };


  },

  update: async (id, updates) => {
    if (!id) {
      throw Object.assign(
        new Error('ID không hợp lệ'),
        { statusCode: 400 }
      );
    }

    const ALLOWED_UPDATE_FIELDS = [
      'email',
    ];

    const filteredUpdates = {};

    for (const key of Object.keys(updates || {})) {
      if (ALLOWED_UPDATE_FIELDS.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      throw Object.assign(
        new Error('Không có dữ liệu hợp lệ để cập nhật'),
        { statusCode: 400 }
      );
    }

    const fields = Object.keys(filteredUpdates)
      .map(field => `${field} = ?`)
      .join(', ');

    const values = [...Object.values(filteredUpdates), id];

    const [result] = await pool.query(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      throw Object.assign(
        new Error('Không tìm thấy người dùng'),
        { statusCode: 404 }
      );
    }

    return true;
  },

  delete: async (id) => {
    if (!id) {
      throw Object.assign(new Error('ID không hợp lệ'), { statusCode: 400 });
    }

    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw Object.assign(
        new Error('Không tìm thấy người dùng'),
        { statusCode: 404 }
      );
    }

    return true;
  },

  findByEmail: async (email) => {
    if (!email) {
      throw Object.assign(
        new Error('Email không hợp lệ'),
        { statusCode: 400 }
      );
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    return rows[0] || null;
  }
};

export default UserService;
