import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // 1. Trích xuất Authorization Header
    // Client (Frontend/Mobile) gửi request kèm Header chứa Token.
    // Ví dụ dữ liệu nhận được: "Bearer eyJhbGciOiJIUzI1NiIsIn..."
    const authHeader = req.headers["authorization"];

    // 2. Validate: Kiểm tra sự tồn tại
    // Nếu không có Header -> Chặn ngay lập tức (Lỗi 401 Unauthorized).
    if (!authHeader) {
      throw Object.assign(new Error("Access Token không được cung cấp"), {
        statusCode: 401,
      });
    }

    // 3. Parse Token: Tách chuỗi theo chuẩn "Bearer Schema"
    // Dữ liệu authHeader được cắt đôi bằng dấu cách " ".
    // Ví dụ: parts = ["Bearer", "eyJhbGciOiJIUzI1NiIsIn..."]
    const parts = authHeader.split(" ");

    // Kiểm tra format: Phải đủ 2 phần và bắt đầu bằng "Bearer".
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw Object.assign(new Error("Token sai định dạng chuẩn Bearer"), {
        statusCode: 401,
      });
    }

    const token = parts[1]; // Đây là chuỗi Token mã hóa thực sự.

    // 4. Verify Token: Giải mã và Xác thực
    // Dùng Secret Key để kiểm tra xem Token có bị làm giả hoặc hết hạn không.
    // Payload là dữ liệu đã giải mã. Ví dụ: { id: 101, email: "dev@gmail.com", iat: 17000... }
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach Context: Gắn thông tin User vào Request
    // Biến `req` được dùng chung cho cả vòng đời request.
    // Gắn payload vào `req.user` giúp Controller phía sau có thể truy cập thông tin user ngay lập tức.
    // Ví dụ: Tại controller chat, chỉ cần gọi `req.user.id` là lấy được ID người gửi.
    req.user = payload;

    // 6. Next: Chuyển tiếp request
    // Cho phép request đi tiếp vào Controller xử lý logic nghiệp vụ.
    next();
  } catch (err) {
    // 7. Exception Handling: Xử lý ngoại lệ
    // Bắt các lỗi: Token hết hạn (TokenExpiredError) hoặc Token rác (JsonWebTokenError).
    err.statusCode = 401;
    next(err);
  }
};

export default authMiddleware;
