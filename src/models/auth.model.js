// ==============================================================================
// AUTH MODEL: THAO TÁC TRỰC TIẾP VỚI DATABASE HỆ THỐNG (BẢNG USERS)
// ==============================================================================
import pool from "../db/index.js";

const AuthModel = {
  /**
   * Lấy thông tin người dùng để phục vụ quá trình đăng nhập.
   * @param {string} email - Email người dùng gửi lên từ form đăng nhập.
   * @returns {Array} - Trả về một mảng chứa thông tin user (nếu tìm thấy).
   */
  login: async (email) => {
    // Sử dụng pool.query để thực thi câu lệnh SQL.
    // Dấu "?" là Placeholder (tham số hóa) để chống tấn công SQL Injection.
    // Dữ liệu [email] sẽ được thư viện mysql2 tự động xử lý an toàn trước khi đưa vào câu lệnh.
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    // Trả về kết quả thô cho Service xử lý tiếp (kiểm tra password, tạo token...).
    return rows;
  },
};

export default AuthModel;
