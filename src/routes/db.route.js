// DATABASE ROUTER: Quản lý các kết nối Database của người dùng.
import Router from "express";
import DBController from "../controllers/db.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

// 1. Áp dụng Bảo vệ (Security Guard):
// Dòng này bắt buộc TẤT CẢ các đường dẫn bên dưới phải đi qua authMiddleware.
// -> Chỉ những ai đã đăng nhập và có Token hợp lệ mới được truy cập các API này.
router.use(authMiddleware);

// 2. Các tuyến đường CRUD cơ bản (Quản lý danh sách kết nối):
router.get("/", DBController.findAll); // Lấy tất cả danh sách kết nối của user
router.get("/:id", DBController.findById); // Lấy chi tiết 1 kết nối cụ thể theo ID
router.post("/", DBController.create); // Tạo mới (lưu) một kết nối database
router.put("/:id", DBController.update); // Cập nhật thông tin kết nối hiện có
router.delete("/:id", DBController.delete); // Xóa bỏ một kết nối

// 3. Các tính năng nghiệp vụ nâng cao (Thao tác với Database khách hàng):
// Thử kết nối tới Database khách hàng xem thông tin có đúng không
router.post("/test-connection", DBController.testConnection);

// Trích xuất cấu trúc (Tables, Columns) từ Database của khách hàng
router.post("/get-schema", DBController.getSchema);

// Lưu cấu trúc Database đã trích xuất vào hệ thống của mình (để AI đọc)
router.post("/update-schema", DBController.updateSchema);

// Kích hoạt (Active) một kết nối để bắt đầu làm việc (Chat với AI)
router.patch("/:id/active", DBController.active);

export default router;
