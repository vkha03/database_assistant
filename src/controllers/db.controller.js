// ==============================================================================
// DB CONTROLLER: ĐIỀU PHỐI QUẢN LÝ KẾT NỐI DATABASE KHÁCH HÀNG
// ==============================================================================
import DBService from "../services/db.service.js";
import successResponse from "../utils/response.js";

const DBController = {
  /**
   * 1. Lấy danh sách tất cả các cấu hình Database có trong hệ thống.
   * Thường dùng cho trang quản trị hoặc danh sách tổng quát.
   */
  findAll: async (req, res, next) => {
    try {
      const rows = await DBService.findAll();
      successResponse(res, rows);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 2. Lấy thông tin chi tiết của một kết nối dựa trên ID.
   * URL: GET /api/databases/:id
   */
  findById: async (req, res, next) => {
    try {
      const row = await DBService.findById(req.params.id);
      successResponse(res, row);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 3. Khởi tạo và lưu một cấu hình kết nối Database mới cho người dùng.
   * Dữ liệu nhạy cảm (mật khẩu) sẽ được Service mã hóa trước khi lưu.
   */
  create: async (req, res, next) => {
    try {
      const row = await DBService.create(req.body);
      // HTTP 201: Created - Tạo mới thành công
      successResponse(res, row, 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 4. Cập nhật thông tin kết nối hiện có (Host, User, Port...).
   * Chỉ cập nhật các trường hợp lệ được định nghĩa trong Whitelist của Service.
   */
  update: async (req, res, next) => {
    try {
      const row = await DBService.update(req.params.id, req.body);
      successResponse(res, row);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 5. Xóa bỏ một cấu hình kết nối khỏi hệ thống.
   */
  delete: async (req, res, next) => {
    try {
      await DBService.delete(req.params.id);
      // HTTP 204: No Content - Xóa thành công, không cần trả về dữ liệu
      successResponse(res, null, 204);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 6. KIỂM TRA KẾT NỐI (Ping Test):
   * Thử đăng nhập vào DB khách hàng để xác nhận thông tin cấu hình là chính xác.
   */
  testConnection: async (req, res, next) => {
    try {
      const userId = req.user.id; // ID người dùng lấy từ JWT Token
      await DBService.testConnection(userId);

      successResponse(res, {
        connected: true,
        message: "Kết nối database khách hàng thành công!",
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * 7. TRÍCH XUẤT CẤU TRÚC (Get Schema):
   * Chỉ đọc danh sách bảng/cột từ DB khách hàng để hiển thị bản xem trước (Preview).
   */
  getSchema: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const schema = await DBService.getSchema(userId);
      successResponse(res, schema);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 8. CẬP NHẬT & LƯU SCHEMA (Update & Save):
   * Lấy cấu trúc mới nhất và LƯU vào Database hệ thống để AI có thể sử dụng làm ngữ cảnh.
   */
  updateSchema: async (req, res, next) => {
    try {
      const userId = req.user.id;

      // FIX LOGIC: Gọi hàm .updateSchema để thực hiện cả việc 'đọc' và 'lưu' vào DB
      const schema = await DBService.updateSchema(userId);

      successResponse(res, schema);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 9. KÍCH HOẠT DATABASE (Active Connection):
   * Đặt một Database làm môi trường làm việc chính cho các truy vấn AI tiếp theo.
   */
  active: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const id = req.params.id;

      await DBService.active(userId, id);
      successResponse(res, null, 204);
    } catch (err) {
      next(err);
    }
  },
};

export default DBController;
