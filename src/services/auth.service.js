import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import AuthModel from "../models/auth.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const AuthService = {
  // 1. NGHIỆP VỤ ĐĂNG NHẬP GOOGLE
  loginGoogle: async (idToken) => {
    if (!idToken) {
      throw Object.assign(new Error("Thiếu Google ID Token!"), {
        statusCode: 400,
      });
    }

    let ticket;
    try {
      // CHỈ bọc try-catch ở đây để "Dịch lỗi" của bên thứ 3 (Google)
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      // Ném thẳng 401, không làm nhiễu logic bên dưới
      throw Object.assign(
        new Error("Token Google không hợp lệ hoặc đã hết hạn!"),
        { statusCode: 401 },
      );
    }

    const { sub: googleId, email } = ticket.getPayload();

    // TỪ ĐÂY TRỞ XUỐNG: KHÔNG DÙNG TRY-CATCH.
    // Nếu DB lỗi, nó sẽ văng thẳng lỗi SQL kèm Stack Trace ra Global Error Handler
    let user = await AuthModel.findUserByGoogleId(googleId);
    if (!user) {
      const insertId = await AuthModel.createUserGoogle(googleId, email);
      user = { id: insertId, google_id: googleId, email, role: "user" };
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await AuthModel.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  },

  // 2. NGHIỆP VỤ XOAY VÒNG TOKEN (ROTATE RT)
  // 2. NGHIỆP VỤ XOAY VÒNG TOKEN (ROTATE RT)
  refreshToken: async (currentToken) => {
    if (!currentToken) {
      throw Object.assign(new Error("Không tìm thấy Refresh Token!"), {
        statusCode: 401,
      });
    }

    let decoded;
    try {
      // Bọc try-catch cục bộ để bắt lỗi JWT (Hết hạn, sai chữ ký)
      decoded = jwt.verify(currentToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      // NGHIỆP VỤ QUAN TRỌNG: Token hết hạn/sai thì phải dọn dẹp rác trong DB
      await AuthModel.deleteRefreshTokenByToken(currentToken);
      throw Object.assign(
        new Error("Refresh Token không hợp lệ hoặc đã hết hạn!"),
        { statusCode: 403 },
      );
    }

    // Phần logic DB bên dưới tự do ném lỗi nguyên bản
    const rtRecord = await AuthModel.findRefreshToken(currentToken);
    if (!rtRecord) {
      throw Object.assign(new Error("Token bất hợp pháp hoặc đã bị thu hồi!"), {
        statusCode: 403,
      });
    }

    await AuthModel.deleteRefreshTokenById(rtRecord.id);

    // =========================================================
    // THÊM MỚI Ở ĐÂY: Query lấy thông tin User thật từ DB
    // =========================================================
    const user = await AuthModel.findUserById(decoded.id);
    if (!user) {
      throw Object.assign(new Error("Không tìm thấy thông tin tài khoản!"), {
        statusCode: 404,
      });
    }

    // Sinh Access Token mới, lấy role chuẩn từ DB ném vào JWT
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role }, // Đã đổi decoded.role thành user.role an toàn tuyệt đối
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );
    const newRefreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    // Lưu ý: Nếu ông đã đổi thành REPLACE INTO như tôi chỉ ban nãy thì cứ dùng saveRefreshToken bình thường
    await AuthModel.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    // =========================================================
    // SỬA RETURN Ở ĐÂY: Đính kèm cục user trả về cho Controller
    // =========================================================
    return {
      newAccessToken,
      newRefreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  },
};

export default AuthService;
