// QUERY ROUTER: Cổng tiếp nhận các truy vấn ngôn ngữ tự nhiên để xử lý bằng AI.
import Router from "express";
import QueryController from "../controllers/query.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

// 1. Lớp bảo mật (Security Layer):
// Chỉ những người dùng đã đăng nhập (có Token hợp lệ) mới được phép sử dụng tính năng AI.
router.use(authMiddleware);

// 2. Tuyến đường xử lý truy vấn:
// URL đầy đủ: POST /api/ai/query
// Nhiệm vụ: Tiếp nhận câu hỏi (VD: "Thống kê doanh thu tháng 1") và trả về dữ liệu tương ứng.
router.post("/query", QueryController.query);

export default router;
