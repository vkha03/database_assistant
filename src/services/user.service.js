// ==============================================================================
// USER SERVICE: QUẢN LÝ NGHIỆP VỤ TÀI KHOẢN NGƯỜI DÙNG
// ==============================================================================
import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";

const UserService = {
  // 1. LẤY DANH SÁCH TẤT CẢ NGƯỜI DÙNG
  findAll: async () => {
    const data = await UserModel.findAll();
    return data;
  },

  // 2. TÌM NGƯỜI DÙNG THEO ID
  findById: async (id) => {
    // Kiểm tra ID đầu vào
    if (!id) {
      throw Object.assign(new Error("ID không hợp lệ"), { statusCode: 400 });
    }

    const data = await UserModel.findById(id);

    // Nếu Model trả về mảng rỗng -> Không tìm thấy User
    if (!data.length) {
      throw Object.assign(new Error("Không tìm thấy người dùng"), {
        statusCode: 404,
      });
    }

    // Trả về đối tượng người dùng duy nhất (phần tử đầu tiên của mảng)
    return data[0];
  },

  // 3. TẠO TÀI KHOẢN MỚI
  create: async (userData) => {
    const { email, password } = userData;

    // Kiểm tra tính đầy đủ của dữ liệu
    if (!email || !password) {
      throw Object.assign(new Error("Thiếu dữ liệu bắt buộc"), {
        statusCode: 400,
      });
    }

    // Kiểm tra xem Email đã tồn tại trong hệ thống chưa (Tránh trùng lặp)
    const existEmail = await UserModel.findByEmail(email);
    if (existEmail.length > 0) {
      throw Object.assign(
        new Error("Email đã tồn tại"),
        { statusCode: 409 }, // 409: Conflict (Xung đột dữ liệu)
      );
    }

    // BẢO MẬT: Băm mật khẩu bằng Bcrypt trước khi lưu
    // Salt rounds = 10 là tiêu chuẩn cân bằng giữa tốc độ và bảo mật.
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await UserModel.create(email, passwordHash);

    return {
      id: result.insertId,
      email,
    };
  },

  // 4. CẬP NHẬT THÔNG TIN NGƯỜI DÙNG (DYNAMIC UPDATE)
  update: async (id, updates) => {
    if (!id) {
      throw Object.assign(new Error("ID không hợp lệ"), { statusCode: 400 });
    }

    // Chỉ cho phép cập nhật các trường nằm trong danh sách trắng (Whitelist)
    const ALLOWED_UPDATE_FIELDS = ["email"];
    const filteredUpdates = {};

    // Lọc bỏ những trường không được phép hoặc rác từ Client gửi lên
    for (const key of Object.keys(updates || {})) {
      if (ALLOWED_UPDATE_FIELDS.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Nếu sau khi lọc không còn dữ liệu nào để cập nhật -> Trả lỗi
    if (Object.keys(filteredUpdates).length === 0) {
      throw Object.assign(new Error("Không có dữ liệu hợp lệ để cập nhật"), {
        statusCode: 400,
      });
    }

    // Xây dựng câu lệnh SQL động (VD: "email = ?")
    const fields = Object.keys(filteredUpdates)
      .map((field) => `${field} = ?`)
      .join(", ");

    const values = [...Object.values(filteredUpdates), id];

    const result = await UserModel.update(fields, values);

    // Kiểm tra xem có bản ghi nào được cập nhật thực tế không
    if (result.affectedRows === 0) {
      throw Object.assign(new Error("Không tìm thấy người dùng"), {
        statusCode: 404,
      });
    }

    return true;
  },

  // 5. XÓA NGƯỜI DÙNG
  delete: async (id) => {
    if (!id) {
      throw Object.assign(new Error("ID không hợp lệ"), { statusCode: 400 });
    }

    const result = await UserModel.delete(id);

    if (result.affectedRows === 0) {
      throw Object.assign(new Error("Không tìm thấy người dùng"), {
        statusCode: 404,
      });
    }

    return true;
  },

  // 6. TÌM KIẾM THEO EMAIL
  findByEmail: async (email) => {
    if (!email) {
      throw Object.assign(new Error("Email không hợp lệ"), { statusCode: 400 });
    }

    const rows = await UserModel.findByEmail(email);
    return rows[0] || null;
  },
};

export default UserService;
