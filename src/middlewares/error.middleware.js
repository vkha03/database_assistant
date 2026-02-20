// GLOBAL ERROR HANDLING MIDDLEWARE
// Middleware này chịu trách nhiệm bắt tất cả các lỗi trong ứng dụng và trả về phản hồi chuẩn cho Client.

export default (err, req, res, next) => {
  // 1. Xác định HTTP Status Code (Mã trạng thái)
  // Nếu lỗi do ta chủ động ném (vd: throw { statusCode: 400 }), thì lấy mã đó.
  // Nếu lỗi do code bị crash (vd: biến undefined, lỗi SQL), mặc định là 500 (Internal Server Error).
  const statusCode = err.statusCode || 500;

  // 2. Server-side Logging (Ghi nhật ký lỗi tại Server)
  // Dùng console.error (không phải console.err) để in lỗi ra màn hình Terminal của Dev.
  // Quan trọng: Phải in stack trace để biết lỗi nằm ở file nào, dòng số mấy.
  // Ví dụ: "[POST] /api/login - LỖI: ... tại auth.service.js:25"
  console.error(`[${req.method}] ${req.url} - LỖI API:`, {
    message: err.message,
    stack: err.stack,
  });

  // 3. Error Masking (Cơ chế che giấu lỗi kỹ thuật)
  // - Nếu là lỗi 500 (Lỗi hệ thống/Code/Database): KHÔNG ĐƯỢC trả message gốc cho User (vì lý do bảo mật).
  //   Ví dụ gốc: "Table 'users' doesn't exist" -> Trả về: "Lỗi hệ thống..."
  // - Nếu là lỗi khác (400, 401, 404): Đây là lỗi nghiệp vụ, cần trả message cho User biết để sửa.
  //   Ví dụ: "Sai mật khẩu", "Email đã tồn tại".
  const resMessage =
    statusCode === 500 ? "Lỗi hệ thống, vui lòng thử lại sau." : err.message;

  // 4. Standardize Response (Chuẩn hóa phản hồi)
  // Trả về JSON theo cấu trúc thống nhất để Frontend dễ xử lý.
  res.status(statusCode).json({
    success: false, // Luôn là false vì đây là lỗi
    message: resMessage || "Lỗi hệ thống chưa được xác định.",
  });
};
