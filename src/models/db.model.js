// ==============================================================================
// DB MODEL: QUẢN LÝ DỮ LIỆU KẾT NỐI VÀ TRÍCH XUẤT CẤU TRÚC (SCHEMA)
// ==============================================================================
import mysql from "mysql2";
import pool from "../db/index.js";

const DBModel = {
  // 1. LẤY DANH SÁCH KẾT NỐI
  // Trả về các thông tin cơ bản, loại bỏ mật khẩu để đảm bảo an toàn.
  findAll: async () => {
    const [rows] = await pool.query(
      "SELECT id, user_id, db_host, db_port, db_name, db_user, schema_version, created_at, updated_at FROM user_databases",
    );
    return rows;
  },

  // 2. TÌM KẾT NỐI THEO ID HOẶC THEO TRẠNG THÁI ACTIVE
  findById: async (id) => {
    const [rows] = await pool.query(
      "SELECT * FROM user_databases WHERE id = ?",
      [id],
    );
    return rows[0];
  },

  findByActive: async (userId) => {
    const [rows] = await pool.query(
      "SELECT * FROM user_databases WHERE user_id = ? AND is_active = 1",
      [userId],
    );
    return rows[0];
  },

  // 3. THÊM MỚI CẤU HÌNH DATABASE
  create: async (
    user_id,
    db_host,
    db_port,
    db_name,
    db_user,
    encryptedPassword,
  ) => {
    const [result] = await pool.query(
      `INSERT INTO user_databases 
       (user_id, db_host, db_port, db_name, db_user, db_password_encrypted) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, db_host, db_port, db_name, db_user, encryptedPassword],
    );
    return result;
  },

  // 4. CẬP NHẬT ĐỘNG (DYNAMIC UPDATE)
  // Nhận vào chuỗi fields đã build sẵn (ví dụ: "db_host = ?, db_port = ?")
  update: async (fields, values) => {
    const [result] = await pool.query(
      `UPDATE user_databases SET ${fields} WHERE id = ?`,
      values,
    );
    return result;
  },

  // 5. XÓA KẾT NỐI
  delete: async (id) => {
    const [result] = await pool.query(
      "DELETE FROM user_databases WHERE id = ?",
      [id],
    );
    return result;
  },

  // 6. LƯU TRỮ CẤU TRÚC JSON (DÀNH CHO AI)
  // Chuyển Schema đã chuẩn hóa thành chuỗi JSON để lưu vào cột schema_json.
  updateSchema: async (newSchema, userId) => {
    const result = await pool.query(
      `UPDATE user_databases SET schema_json = ? WHERE user_id = ? AND is_active = 1`,
      [JSON.stringify(newSchema), userId],
    );
    return result;
  },

  // 7. TRÍCH XUẤT SIÊU DỮ LIỆU (REVERSE ENGINEERING)
  // Đây là câu lệnh SQL quan trọng nhất: Truy cập vào 'information_schema' của DB khách
  // để lấy thông tin về Bảng, Cột, Kiểu dữ liệu và Khóa ngoại (Foreign Key).
  getSchema: async (connection, dbName) => {
    const [rows] = await connection.query(
      `
SELECT 
    c.TABLE_NAME, 
    c.COLUMN_NAME, 
    c.COLUMN_TYPE, 
    c.COLUMN_KEY, 
    c.COLUMN_COMMENT,
    k.REFERENCED_TABLE_NAME, 
    k.REFERENCED_COLUMN_NAME
FROM information_schema.COLUMNS c
LEFT JOIN information_schema.KEY_COLUMN_USAGE k 
    ON c.TABLE_SCHEMA = k.TABLE_SCHEMA 
    AND c.TABLE_NAME = k.TABLE_NAME 
    AND c.COLUMN_NAME = k.COLUMN_NAME
WHERE c.TABLE_SCHEMA = ?
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;
        `,
      [dbName],
    );
    return rows;
  },

  // 8. QUẢN LÝ TRẠNG THÁI ACTIVE
  // unActive: Tắt tất cả kết nối của User để chuẩn bị bật 1 cái mới.
  unActive: async (userId) => {
    const [result] = await pool.query(
      "UPDATE user_databases SET is_active = 0 WHERE user_id = ?",
      [userId],
    );
    return result;
  },

  // active: Bật kết nối cụ thể mà User chọn.
  active: async (userId, id) => {
    const [result] = await pool.query(
      "UPDATE user_databases SET is_active = 1 WHERE user_id = ? AND id = ?",
      [userId, id],
    );
    return result;
  },
};

export default DBModel;
