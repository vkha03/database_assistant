import AppError from "../utils/error.util.js";
import JwtUtils from "../utils/jwt.util.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return next(new AppError("Access Token không được cung cấp", 401));
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(new AppError("Token sai định dạng chuẩn Bearer", 401));
  }

  const token = parts[1];

  try {
    const payload = JwtUtils.verifyAccessToken(token);
    req.user = payload;

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token hết hạn!", 401));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Token không hợp lệ!", 401));
    }

    return next(new AppError("Lỗi server nội bộ", 500));
  }
};

export default authMiddleware;
