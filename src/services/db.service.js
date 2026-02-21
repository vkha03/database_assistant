// ==============================================================================
// DB SERVICE: XỬ LÝ NGHIỆP VỤ KẾT NỐI VÀ QUẢN LÝ CẤU TRÚC DATABASE
// ==============================================================================
import mysql from "mysql2/promise";
import Crypto from "../utils/crypto.js";
import normallizeSchema from "../utils/normallizeSchema.js";
import DBModel from "../models/db.model.js";

// Danh sách các trường (fields) hợp lệ được phép cập nhật.
// Dùng để lọc dữ liệu rác từ Client gửi lên (Whitelist).
const ALLOWED_FIELDS = [
  "db_host",
  "db_port",
  "db_name",
  "db_user",
  "db_password",
  "schema_version",
];

const DBService = {
  // 1. KHỞI TẠO KẾT NỐI (BRIDGE)
  // Hàm này lấy thông tin cấu hình từ DB hệ thống và tạo kết nối thực tế tới DB khách hàng.
  getConnection: async (userId) => {
    // Tìm cấu hình DB đang ở trạng thái 'active' của người dùng.
    const dbInfo = await DBService.findByActive(userId);

    // Giải mã mật khẩu (Password được lưu trong DB hệ thống dưới dạng mã hóa AES).
    const password = dbInfo.db_password_encrypted
      ? Crypto.decryptPassword(dbInfo.db_password_encrypted)
      : "";

    // Tạo kết nối bằng mysql2/promise.
    try {
      const connection = await mysql.createConnection({
        host: dbInfo.db_host,
        user: dbInfo.db_user,
        password,
        database: dbInfo.db_name,
        port: dbInfo.db_port,
        connectTimeout: 5000, // Ngắt nếu sau 5 giây không kết nối được.
      });

      return { connection, dbName: dbInfo.db_name };
    } catch {
      throw Object.assign(
        new Error(
          "Sai cấu hình database hoặc hệ thống đang lỗi, vui lòng thử lại!",
        ),
        {
          statusCode: 404,
        },
      );
    }
  },

  // 2. CÁC HÀM TRUY VẤN THÔNG TIN (READ)
  findAll: async () => await DBModel.findAll(),

  findById: async (id) => {
    const data = await DBModel.findById(id);
    if (!data)
      throw Object.assign(new Error("Không tìm thấy kết nối DB"), {
        statusCode: 404,
      });
    return data;
  },

  findByActive: async (userId) => {
    const data = await DBModel.findByActive(userId);
    if (!data)
      throw Object.assign(new Error("Không tìm thấy kết nối DB"), {
        statusCode: 404,
      });
    return data;
  },

  // 3. TẠO MỚI CẤU HÌNH (CREATE)
  create: async (userId, data) => {
    const { db_host, db_port, db_name, db_user, db_password } = data;

    // Kiểm tra dữ liệu bắt buộc (Server-side validation).
    if (
      !userId ||
      !db_host ||
      !db_port ||
      !db_name ||
      !db_user ||
      !db_password
    ) {
      throw Object.assign(new Error("Thiếu dữ liệu bắt buộc"), {
        statusCode: 400,
      });
    }

    // Mã hóa mật khẩu trước khi lưu vào Database hệ thống để bảo mật.
    const encryptedPassword = Crypto.encryptPassword(db_password);

    const result = await DBModel.create(
      userId,
      db_host,
      db_port,
      db_name,
      db_user,
      encryptedPassword,
    );

    return {
      id: result.insertId,
      userId,
      db_host,
      db_port,
      db_name,
      db_user,
    };
  },

  // 4. CẬP NHẬT ĐỘNG (PATCH/DYNAMIC UPDATE)
  // Hàm này chỉ cập nhật những trường thực sự thay đổi.
  update: async (id, updates) => {
    if (!id)
      throw Object.assign(new Error("ID không hợp lệ"), { statusCode: 400 });

    const filtered = {};
    // Lặp qua dữ liệu gửi lên, chỉ lấy những trường nằm trong ALLOWED_FIELDS.
    for (const key of Object.keys(updates)) {
      if (!ALLOWED_FIELDS.includes(key)) continue;

      // Nếu cập nhật mật khẩu thì phải mã hóa lại trước khi lưu.
      if (key === "db_password") {
        filtered.db_password_encrypted = Crypto.encryptPassword(
          updates.db_password,
        );
      } else {
        filtered[key] = updates[key];
      }
    }

    if (Object.keys(filtered).length === 0) {
      throw Object.assign(new Error("Không có trường hợp lệ để cập nhật"), {
        statusCode: 400,
      });
    }

    // Chuyển Object thành chuỗi SQL: "field1 = ?, field2 = ?"
    const fields = Object.keys(filtered)
      .map((k) => `${k} = ?`)
      .join(", ");
    const values = [...Object.values(filtered), id];

    const result = await DBModel.update(fields, values);
    if (result.affectedRows === 0)
      throw Object.assign(new Error("Không tìm thấy kết nối DB"), {
        statusCode: 404,
      });

    return true;
  },

  // 5. XÓA CẤU HÌNH (DELETE)
  delete: async (id) => {
    const result = await DBModel.delete(id);
    if (result.affectedRows === 0)
      throw Object.assign(new Error("Không tìm thấy kết nối DB"), {
        statusCode: 404,
      });
    return true;
  },

  // 6. KIỂM TRA KẾT NỐI (HEALTH CHECK)
  testConnection: async (userId) => {
    const { connection } = await DBService.getConnection(userId);

    try {
      await connection.execute("SELECT 1"); // Chạy một câu lệnh đơn giản nhất để test.
      return true;
    } catch (err) {
      console.error("ERROR:", err.message);
      throw Object.assign(
        new Error("Không thể kết nối tới database khách hàng"),
        { statusCode: 400 },
      );
    } finally {
      // LUÔN LUÔN phải đóng kết nối sau khi test để giải phóng bộ nhớ.
      await connection.end();
    }
  },

  // 7. TRÍCH XUẤT CẤU TRÚC (REVERSE ENGINEERING)
  getSchema: async (userId) => {
    const { connection, dbName } = await DBService.getConnection(userId);

    try {
      // Lấy danh sách bảng/cột từ DB khách hàng.
      const result = await DBModel.getSchema(connection, dbName);
      // Chuyển đổi thành định dạng JSON chuẩn cho AI đọc.
      return normallizeSchema(result);
    } catch (err) {
      console.error("ERROR:", err.message);
      throw Object.assign(new Error("Không thể lấy được cấu trúc database"), {
        statusCode: 400,
      });
    } finally {
      await connection.end();
    }
  },

  // 8. CẬP NHẬT SCHEMA VÀO HỆ THỐNG
  updateSchema: async (userId) => {
    const newSchema = await DBService.getSchema(userId);

    try {
      // Lưu Schema đã trích xuất vào database của app để AI sử dụng làm context.
      await DBModel.updateSchema(newSchema, userId);

      return newSchema;
    } catch (err) {
      console.error("ERROR:", err.message);
      throw Object.assign(new Error("Không thể cập nhật cấu trúc database"), {
        statusCode: 500,
      });
    }
  },

  // 9. KÍCH HOẠT DATABASE (ACTIVE/SWITCH)
  active: async (userId, id) => {
    // Bước 1: Tắt trạng thái active của tất cả các kết nối hiện tại của user này.
    await DBModel.unActive(userId);
    // Bước 2: Kích hoạt duy nhất kết nối mà user chọn.
    const active = await DBModel.active(userId, id);
    if (active.affectedRows === 0)
      throw Object.assign(new Error("Không tìm thấy kết nối DB"), {
        statusCode: 404,
      });

    return true;
  },
};

export default DBService;
