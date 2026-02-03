// ROOT ROUTER: Hệ thống điều hướng trung tâm của ứng dụng.
import Router from "express";
import userRoute from "./user.route.js";
import authRoute from "./auth.route.js";
import dbRoute from "./db.route.js";
import queryRoute from "./query.route.js";

const router = Router();

// Định nghĩa các phân khu API (Endpoint Groups):

// 1. Quản lý người dùng. Ví dụ: GET /api/users/profile
router.use("/users", userRoute);

// 2. Xác thực & Đăng nhập. Ví dụ: POST /api/auth/login
router.use("/auth", authRoute);

// 3. Quản lý kết nối Database khách hàng. Ví dụ: POST /api/databases/connect
router.use("/databases", dbRoute);

// 4. Xử lý truy vấn bằng AI. Ví dụ: POST /api/ai/query
router.use("/ai", queryRoute);

export default router;
