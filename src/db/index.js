// ==============================================================================
// DATABASE CONNECTION POOL: QUẢN LÝ KẾT NỐI TẬP TRUNG (HỆ THỐNG)
// ==============================================================================
import mysql from "mysql2/promise";
import dbConfig from "../config/database.js";

// 1. Xác định môi trường chạy (Development, Production hoặc Test)
// Nếu không có biến môi trường NODE_ENV, mặc định sẽ dùng 'development'.
const env = process.env.NODE_ENV || "development";

// Lấy thông tin cấu hình (host, user, pass...) tương ứng với môi trường đó.
const config = dbConfig[env];

// 2. Khởi tạo Connection Pool
// Thay vì mỗi request tạo 1 kết nối mới (rất tốn tài nguyên), ta dùng Pool (Hồ kết nối).
// Pool sẽ giữ sẵn một số kết nối mở và tái sử dụng chúng cho nhiều request khác nhau.
const pool = mysql.createPool({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,

  // Cấu hình tối ưu cho hiệu năng:
  waitForConnections: true, // Nếu hết kết nối trống, request sẽ đợi thay vì báo lỗi ngay.
  connectionLimit: 10, // Giới hạn tối đa 10 kết nối đồng thời (tùy quy mô dự án).
  queueLimit: 0, // Không giới hạn số lượng request đợi trong hàng chờ.
});

// 3. Xuất Pool để các Models sử dụng thực thi SQL
export default pool;
