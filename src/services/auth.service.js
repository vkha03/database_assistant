// AUTH SERVICE: Xử lý các nghiệp vụ xác thực người dùng.
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AuthModel from "../models/auth.model.js";
import UserModel from "../models/user.model.js";

const AuthService = {
  // 1. NGHIỆP VỤ ĐĂNG NHẬP
  login: async (email, password) => {
    // Tìm kiếm thông tin user trong Database thông qua Model
    const result = await AuthModel.login(email);
    const user = result[0];

    // Kiểm tra tồn tại của User
    if (!user) {
      throw Object.assign(new Error("Email không tồn tại!"), {
        statusCode: 404,
      });
    }

    // Kiểm tra mật khẩu: So sánh mật khẩu người dùng nhập với bản băm (Hash) trong DB
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw Object.assign(new Error("Sai mật khẩu!"), { statusCode: 404 });
    }

    // Cấp "vé thông hành" (JWT): Chứa thông tin User ID, hết hạn sau 10 giờ
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "10h",
    });

    return { token, id: user.id, email: user.email };
  },

  // 2. NGHIỆP VỤ ĐĂNG KÝ
  register: async (email, password) => {
    // Kiểm tra dữ liệu đầu vào (Validation cơ bản)
    if (!email || !password) {
      throw Object.assign(new Error("Thiếu dữ liệu bắt buộc"), {
        statusCode: 400,
      });
    }

    // Kiểm tra trùng lặp: Không cho phép đăng ký 2 tài khoản cùng email
    const existEmail = await UserModel.findByEmail(email);
    if (existEmail.length > 0) {
      throw Object.assign(new Error("Email đã tồn tại"), { statusCode: 409 });
    }

    // Bảo mật mật khẩu: Băm mật khẩu bằng thuật toán Bcrypt (Salt rounds = 10)
    // Tuyệt đối không lưu mật khẩu dạng văn bản thuần (plain text) vào DB.
    const passwordHash = await bcrypt.hash(password, 10);

    // Lưu User mới vào Database
    const result = await UserModel.create(email, passwordHash);

    return {
      id: result.insertId,
      email,
    };
  },
};

export default AuthService;
