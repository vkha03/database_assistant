// USER CONTROLLER: Quản lý các nghiệp vụ liên quan đến tài khoản người dùng hệ thống.
import UserService from "../services/user.service.js";
import successResponse from "../utils/response.js";

const UserController = {
  // 1. Lấy danh sách toàn bộ người dùng
  // Thường dùng cho trang quản trị (Admin Dashboard).
  findAll: async (req, res, next) => {
    try {
      const users = await UserService.findAll();
      successResponse(res, users); // Trả về mảng danh sách user
    } catch (err) {
      next(err); // Đẩy lỗi về Middleware xử lý tập trung
    }
  },

  // 2. Tìm kiếm người dùng cụ thể bằng ID
  // Ví dụ: GET /api/users/15
  findById: async (req, res, next) => {
    try {
      // req.params.id lấy giá trị '15' từ URL
      const user = await UserService.findById(req.params.id);
      successResponse(res, user);
    } catch (err) {
      next(err);
    }
  },

  // 3. Tạo tài khoản người dùng mới (Thủ công)
  // Thường dùng khi Admin thêm thành viên mới mà không qua trang đăng ký công khai.
  create: async (req, res, next) => {
    try {
      const newUser = await UserService.create(req.body);
      // Trả về mã 201: Đã tạo mới (Created) thành công
      successResponse(res, newUser, 201);
    } catch (err) {
      next(err);
    }
  },

  // 4. Cập nhật thông tin tài khoản
  // Ví dụ: Thay đổi họ tên, quyền hạn (Role) của một user.
  update: async (req, res, next) => {
    try {
      const updatedUser = await UserService.update(req.params.id, req.body);
      successResponse(res, updatedUser);
    } catch (err) {
      next(err);
    }
  },

  // 5. Xóa tài khoản khỏi hệ thống
  // Hành động này thường đi kèm với việc xóa các cấu hình DB liên quan của User đó.
  delete: async (req, res, next) => {
    try {
      await UserService.delete(req.params.id);
      // Trả về mã 204: Thành công nhưng không cần trả về nội dung (No Content)
      successResponse(res, null, 204);
    } catch (err) {
      next(err);
    }
  },
};

export default UserController;
