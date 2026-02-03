// ==============================================================================
// DATABASE CONFIGURATION: CẤU HÌNH KẾT NỐI THEO MÔI TRƯỜNG (ENV)
// ==============================================================================
import "dotenv/config"; // Nạp các biến môi trường từ file .env vào process.env

export default {
  // 1. Môi trường phát triển (Local Development)
  // Sử dụng khi bạn đang code trên máy cá nhân.
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "database_assistant",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql", // Loại cơ sở dữ liệu sử dụng
  },

  // 2. Môi trường kiểm thử (Testing)
  // Dùng để chạy các bản test tự động mà không làm ảnh hưởng đến dữ liệu đang code.
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "database_test",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
  },

  // 3. Môi trường chạy thực tế (Production)
  // Khi đẩy code lên Server thật (VPS, Cloud).
  // Ở đây KHÔNG có giá trị mặc định (|| 'root') để đảm bảo tính bảo mật tuyệt đối,
  // buộc phải khai báo chính xác trong file .env của Server.
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
  },
};
