import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AuthModel from '../models/auth.model.js';
import UserModel from '../models/user.model.js';

const AuthService = {
  login: async (email, password) => {
    const result = await AuthModel.login(email);
    const user = result[0];

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
  },

  register: async (email, password) => {
    if (!email || !password) {
      throw Object.assign(
        new Error('Thiếu dữ liệu bắt buộc'),
        { statusCode: 400 }
      );
    }

    const existEmail = await UserModel.findByEmail(email);

    if (existEmail.length > 0) {
      throw Object.assign(
        new Error('Email đã tồn tại'),
        { statusCode: 409 }
      )
    };

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await UserModel.create(email, passwordHash);

    return {
      id: result.insertId,
      email
    };
  }
};

export default AuthService;
