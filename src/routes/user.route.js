// USER ROUTER: Quản lý các thao tác liên quan đến thông tin tài khoản (Profile).
import Router from "express";
import UserController from "../controllers/user.controller.js";

const router = Router();

// Định nghĩa bộ API CRUD (Create - Read - Update - Delete) cho thực thể User:

// 1. Lấy danh sách tất cả người dùng (Thường dùng cho trang Admin).
router.get("/", UserController.findAll);

// 2. Lấy thông tin chi tiết một người dùng cụ thể dựa trên ID.
// Ví dụ: GET /api/users/10
router.get("/:id", UserController.findById);

// 3. Tạo mới một người dùng (Thường dùng khi Admin thêm thủ công).
router.post("/", UserController.create);

// 4. Cập nhật thông tin người dùng hiện có.
// Ví dụ: PUT /api/users/10 (Gửi kèm dữ liệu cần sửa trong Body)
router.put("/:id", UserController.update);

// 5. Xóa tài khoản người dùng khỏi hệ thống.
router.delete("/:id", UserController.delete);

export default router;
