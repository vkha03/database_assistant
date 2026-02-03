// AUTH CONTROLLER: Điều hướng yêu cầu Đăng nhập và Đăng ký.
import AuthService from "../services/auth.service.js";
import responseSuccess from "../utils/response.js";

const AuthController = {
  // 1. Xử lý Đăng nhập (Login)
  login: async (req, res, next) => {
    try {
      // Trích xuất Email và Password từ Body của Request.
      // Ví dụ: { "email": "admin@gmail.com", "password": "123" }
      const { email, password } = req.body;

      // Gọi nghiệp vụ Login từ AuthService để kiểm tra tài khoản và tạo Token.
      const result = await AuthService.login(email, password);

      // Nếu thành công, trả về dữ liệu chuẩn cho Frontend (status: success, data: result).
      responseSuccess(res, result, 200);
    } catch (error) {
      // Nếu có lỗi (Sai pass, không tìm thấy user...), đẩy lỗi sang Global Error Handler.
      next(error);
    }
  },

  // 2. Xử lý Đăng ký (Register)
  register: async (req, res, next) => {
    try {
      // Tiếp nhận thông tin đăng ký mới từ Client.
      const { email, password } = req.body;

      // Gọi nghiệp vụ Register để lưu User mới vào Database hệ thống.
      const result = await AuthService.register(email, password);

      // Trả về phản hồi thành công kèm thông tin User vừa tạo.
      responseSuccess(res, result, 200);
    } catch (error) {
      // Chuyển tiếp lỗi (ví dụ: Email đã tồn tại) để Middleware xử lý.
      next(error);
    }
  },
};

export default AuthController;
