import pool from '../db/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const AuthService = {
  login: async (email, password) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      throw Object.assign(
        new Error('Email không tồn tại!'),
        { statusCode: 404 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw Object.assign(
        new Error('Sai mật khẩu!'),
        { statusCode: 404 }
      )
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '10h',
    });

    return {
      token,
      id: user.id,
      email: user.email
    };
  }
};

export default AuthService;
