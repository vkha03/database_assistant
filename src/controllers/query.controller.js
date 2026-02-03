// QUERY CONTROLLER: Bộ điều khiển trung tâm xử lý truy vấn AI.
import QueryService from "../services/query.service.js";
import successResponse from "../utils/response.js";

const QueryController = {
  // 1. Hàm Query chính: Xử lý câu hỏi của người dùng.
  query: async (req, res, next) => {
    try {
      // 2. Định danh người dùng: Lấy ID từ Token đã xác thực (để biết họ đang dùng DB nào).
      const userId = req.user.id;

      // 3. Trích xuất câu hỏi: Lấy nội dung câu hỏi từ Client gửi lên.
      // Ví dụ: { "question": "Liệt kê 5 khách hàng mua nhiều nhất tháng này" }
      const { question } = req.body;

      // 4. Validation (Kiểm tra đầu vào):
      // Nếu không có câu hỏi -> Ném lỗi 400 (Bad Request) về cho Client.
      if (!question) {
        throw Object.assign(new Error("Câu hỏi không được để trống"), {
          statusCode: 400,
        });
      }

      // 5. Gọi Service xử lý AI:
      // - Chuyển câu hỏi sang Service để phối hợp với AI (Gemini/OpenAI).
      // - Service sẽ: Tìm Schema DB -> Gửi AI tạo SQL -> Thực thi SQL -> Trả kết quả.
      const result = await QueryService.query(userId, question);

      // 6. Trả về kết quả cuối cùng cho người dùng.
      successResponse(res, result);
    } catch (err) {
      // 7. Chuyển tiếp lỗi sang Middleware xử lý lỗi tập trung.
      next(err);
    }
  },
};

export default QueryController;
