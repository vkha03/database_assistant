// ==============================================================================
// USER MODEL: THAO TÁC TRỰC TIẾP VỚI BẢNG USERS TRONG DATABASE HỆ THỐNG
// ==============================================================================
import pool from "../db/index.js";

const UserModel = {
  // 1. LẤY TẤT CẢ NGƯỜI DÙNG
  // Trả về toàn bộ danh sách để phục vụ mục đích quản trị.
  findAll: async () => {
    return await pool.query("SELECT * FROM users");
  },

  // 2. TÌM NGƯỜI DÙNG THEO ID
  // Sử dụng LIMIT 1 để tối ưu tốc độ truy vấn vì ID là duy nhất.
  findById: async (id) => {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id],
    );
    return rows;
  },

  // 3. TẠO NGƯỜI DÙNG MỚI
  // Lưu trữ email và mật khẩu đã được băm (password_hash).
  create: async (email, passwordHash) => {
    const [result] = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, passwordHash],
    );
    return result;
  },

  // 4. CẬP NHẬT THÔNG TIN (DYNAMIC UPDATE)
  // Lưu ý: fields và values phải được truyền vào từ Service để build câu lệnh động.
  update: async (fields, values) => {
    const [result] = await pool.query(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values,
    );
    return result;
  },

  // 5. XÓA NGƯỜI DÙNG
  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return result;
  },

  // 6. TÌM KIẾM THEO EMAIL
  // Dùng trong nghiệp vụ Đăng nhập hoặc Kiểm tra email trùng lặp khi Đăng ký.
  findByEmail: async (email) => {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    return rows;
  },
};

export default UserModel;
