// ==============================================================================
// DYNAMIC POOL MANAGER: QUẢN LÝ KẾT NỐI ĐA DATABASE (KHÁCH HÀNG)
// ==============================================================================
import mysql from "mysql2/promise";

/**
 * userPool: Đóng vai trò là một bộ nhớ đệm (Cache).
 * Lưu trữ các Connection Pool đã được khởi tạo để tái sử dụng,
 * tránh việc mỗi lần truy vấn lại phải tạo một Pool mới gây tốn tài nguyên.
 */
const userPool = {};

/**
 * Export một hàm khởi tạo/lấy Pool dựa trên thông tin cấu hình DB khách hàng.
 */
export default (host, user, password = "", database) => {
  // 1. Tạo một 'khóa' duy nhất (Key) cho mỗi Database dựa trên Host, DB Name và User.
  // Mục đích: Phân biệt các kết nối khác nhau trong cache userPool.
  const poolKey = `${host}_${database}_${user}`;

  // 2. Kiểm tra Cache:
  // Nếu đã tồn tại kết nối tới DB này rồi, trả về luôn để sử dụng tiếp.
  if (userPool[poolKey]) return userPool[poolKey];

  // 3. Khởi tạo Pool mới nếu chưa có trong Cache:
  // Thiết lập các thông số tối ưu để đảm bảo ứng dụng không làm sập DB khách hàng.
  const newPool = mysql.createPool({
    host,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10, // Giới hạn mỗi khách hàng tối đa 10 kết nối đồng thời.
    queueLimit: 0,
  });

  // 4. Lưu Pool mới vào Cache để lần sau không phải tạo lại.
  userPool[poolKey] = newPool;

  // 5. Trả về Pool để thực thi các câu lệnh SQL.
  return newPool;
};
