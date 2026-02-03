// ==============================================================================
// QUERY SERVICE: TRUNG TÂM XỬ LÝ TRUY VẤN THÔNG MINH (AI + DATABASE)
// ==============================================================================
import DBService from "./db.service.js";
import getPool from "../db/user.db.js";
import Crypto from "../utils/crypto.js";
import AIHandle from "./ai.service.js";

const QueryService = {
  /**
   * Hàm xử lý chính: Nhận câu hỏi từ người dùng -> Nhờ AI viết SQL -> Thực thi trên DB khách hàng.
   * @param {number} userId - ID của người dùng đang đặt câu hỏi.
   * @param {string} question - Câu hỏi bằng ngôn ngữ tự nhiên (VD: "Top 5 doanh thu tháng 1").
   */
  query: async (userId, question) => {
    let SQL; // Biến tạm lưu câu SQL để phục vụ mục đích log lỗi nếu có.

    try {
      // 1. LẤY THÔNG TIN DATABASE & PROMPT ENGINEERING
      // Truy vấn thông tin cấu hình và cấu trúc Database (Schema) của người dùng từ hệ thống.
      const dbInfo = await DBService.findById(userId);

      // 2. NHỜ AI VIẾT SQL (AI ORCHESTRATION)
      // Gửi câu hỏi và "bản vẽ" Database sang AI Service để nhận về câu lệnh SQL chuẩn.
      const generatedSQL = await AIHandle(question, dbInfo.schema_json);

      // 3. GIẢI MÃ THÔNG TIN KẾT NỐI (SECURITY DECRYPTION)
      // Lấy mật khẩu đã mã hóa từ DB hệ thống và giải mã để có thể đăng nhập vào DB khách hàng.
      const password = dbInfo.db_password_encrypted
        ? Crypto.decryptPassword(dbInfo.db_password_encrypted)
        : "";

      // 4. KHỞI TẠO POOL KẾT NỐI TẠM THỜI
      // Tạo một hồ kết nối (Pool) dựa trên thông tin DB riêng của khách hàng.
      const userPool = getPool(
        dbInfo.db_host,
        dbInfo.db_user,
        password,
        dbInfo.db_name,
      );

      SQL = generatedSQL; // Lưu lại câu SQL đã tạo để hiển thị cho Frontend.

      // 5. THỰC THI TRUY VẤN (SQL EXECUTION)
      // Chạy câu lệnh SQL do AI tạo ra trên Database của khách hàng.
      // rows: chứa dữ liệu kết quả, fields: chứa thông tin định dạng cột.
      const [rows, fields] = await userPool.query(generatedSQL);

      // 6. PHẢN HỒI KẾT QUẢ (STANDARDIZED RESPONSE)
      return {
        question, // Câu hỏi gốc của người dùng.
        sql: generatedSQL, // Câu lệnh SQL mà AI đã "nghĩ" ra (giúp User kiểm tra tính chính xác).
        data: rows, // Dữ liệu thực tế để hiển thị lên bảng biểu/biểu đồ.
      };
    } catch (error) {
      // ==========================================================================
      // XỬ LÝ NGOẠI LỆ (ERROR HANDLING)
      // ==========================================================================
      console.error("QueryService Error:", error);

      // Ném lỗi kèm theo câu SQL bị sai để Developer có thể debug hoặc hiển thị cho User.
      // Dùng Object.assign để "đính kèm" thêm thông tin SQL vào đối tượng Error chuẩn.
      throw Object.assign(
        new Error(`Không thể xử lý câu hỏi lúc này: ${error.message}`),
        { SQL },
      );
    }
  },
};

export default QueryService;
