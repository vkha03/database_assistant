// AUTH ROUTER: Định nghĩa các tuyến đường (routes) liên quan đến xác thực.
import Router from "express";
import AuthController from "../controllers/auth.controller.js";

const router = Router();

// 1. Tuyến đường Đăng nhập: Chấp nhận phương thức POST.
// URL đầy đủ: /api/auth/login
// Nhiệm vụ: Tiếp nhận email/password, xác thực và trả về JWT Token.
router.post("/login", AuthController.login);

// 2. Tuyến đường Đăng ký: Chấp nhận phương thức POST.
// URL đầy đủ: /api/auth/register
// Nhiệm vụ: Tạo tài khoản mới trong hệ thống.
router.post("/register", AuthController.register);

export default router;
