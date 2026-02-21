import AuthService from "../services/auth.service.js";
import responseSuccess from "../utils/response.js"; // Thay đường dẫn cho đúng với project của ông

const AuthController = {
  // 1. NGHIỆP VỤ ĐĂNG NHẬP GOOGLE
  loginGoogle: async (req, res, next) => {
    try {
      const { idToken } = req.body;

      // 1. Gọi Service thực thi logic.
      // Nếu có lỗi trong Service (vd: Token Google sai), Service sẽ ném lỗi và nhảy thẳng xuống catch.
      const result = await AuthService.loginGoogle(idToken);

      // 2. Set Cookie chứa Refresh Token
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax", // Dev thì Lax, Deploy thì Strict
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // 3. Tách Refresh Token ra, chỉ trả Access Token và User về cho FE
      const dataPayload = {
        accessToken: result.accessToken,
        user: result.user,
      };

      // 4. Dùng Success Helper chuẩn của ông
      return responseSuccess(res, dataPayload, 200);
    } catch (error) {
      // Đẩy lỗi cho Global Error Handling Middleware xử lý và ghi log
      next(error);
    }
  },

  // 2. NGHIỆP VỤ XOAY VÒNG TOKEN (ROTATE RT)
  refreshToken: async (req, res, next) => {
    try {
      // 1. Đọc Cookie (Yêu cầu phải cài thư viện cookie-parser ở app.js)
      const currentToken = req.cookies?.refreshToken;

      // Nếu không có cookie thì chủ động ném lỗi để Error Middleware bắt
      if (!currentToken) {
        const error = new Error("Không tìm thấy Refresh Token trong Cookie!");
        error.statusCode = 401;
        throw error;
      }

      // 2. Lấy Token mới và thông tin user từ Service
      const result = await AuthService.refreshToken(currentToken);

      // 3. Set lại Cookie bằng Refresh Token mới
      res.cookie("refreshToken", result.newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // 4. Dữ liệu trả về cho Frontend (Có cả user để khôi phục State)
      const dataPayload = {
        accessToken: result.newAccessToken,
        user: result.user,
      };

      // 5. Dùng Success Helper chuẩn của ông
      return responseSuccess(res, dataPayload, 200);
    } catch (error) {
      // Bất kỳ lỗi nào (Hết hạn, sai chữ ký, DB lỗi) -> Xóa cookie bảo vệ người dùng
      res.clearCookie("refreshToken");
      // Đẩy lỗi ra cho Global Error Middleware
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      // 1. Nếu có token thì mới gọi Service xóa trong DB
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      // 2. LUÔN LUÔN xóa cookie ở trình duyệt (Dù có token hay không)
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false, // Dev thì false
        sameSite: "Lax",
      });

      // 3. Trả về thành công để FE chuyển hướng về trang Login
      return responseSuccess(res, { message: "Đăng xuất thành công" }, 200);
    } catch (err) {
      next(err);
    }
  },
};

export default AuthController;
