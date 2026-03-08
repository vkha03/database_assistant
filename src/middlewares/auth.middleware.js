import JwtUtils from "../utils/jwt.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return next(
      Object.assign(new Error("Access Token không được cung cấp"), {
        statusCode: 401,
      }),
    );
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(
      Object.assign(new Error("Token sai định dạng chuẩn Bearer"), {
        statusCode: 401,
      }),
    );
  }

  const token = parts[1];

  try {
    const payload = JwtUtils.verifyAccessToken(token);
    req.user = payload;

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        Object.assign(new Error("Token hết hạn!"), {
          statusCode: 401,
        }),
      );
    }

    if (error.name === "JsonWebTokenError") {
      return next(
        Object.assign(new Error("Token không hợp lệ!"), {
          statusCode: 403,
        }),
      );
    }

    return next(
      Object.assign(new Error("Lỗi server nội bộ"), {
        statusCode: 500,
      }),
    );
  }
};

export default authMiddleware;
