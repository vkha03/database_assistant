// AI HANDLE UTILITY: Giao tiếp với Google Gemini AI để chuyển câu hỏi thành SQL.
import { GoogleGenerativeAI } from "@google/generative-ai";
import promptAI from "../utils/prompt.js";

const AIHandle = async (question, schema) => {
  // 1. Khởi tạo kết nối với Google Generative AI bằng API Key từ file .env.
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // 2. Cấu hình Model AI (Ví dụ: gemini-1.5-flash).
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_API_MODEL,
  });

  // 3. Chuẩn bị Prompt (Lời dẫn):
  // Kết hợp câu hỏi của User và cấu trúc Database (Schema) để AI hiểu ngữ cảnh.
  const prompt = promptAI(question, schema);

  // 4. Gửi yêu cầu và nhận phản hồi từ AI.
  const result = await model.generateContent(prompt);

  // 5. Trích xuất nội dung văn bản (Câu SQL) từ phản hồi của AI.
  let generatedSQL = result.response.text().trim();

  // --------------------------------------------------------------------------
  // BƯỚC 6: SANITIZATION (LÀM SẠCH DỮ LIỆU) - CỰC KỲ QUAN TRỌNG
  // --------------------------------------------------------------------------

  // AI thường hay bọc code trong dấu ```sql ... ```.
  // Ta cần loại bỏ những ký tự này để lấy được câu lệnh SQL thuần túy.
  generatedSQL = generatedSQL.replace(/```sql|```/g, "").trim();

  // --------------------------------------------------------------------------
  // BƯỚC 7: SECURITY CHECK (KIỂM TRA AN TOÀN) - CHỐNG TẤN CÔNG DATABASE
  // --------------------------------------------------------------------------

  // Nghiêm cấm AI thực hiện các lệnh phá hoại (DELETE, DROP, UPDATE).
  // Chỉ chấp nhận các câu lệnh đọc dữ liệu (SELECT) hoặc bảng tạm (WITH).
  const isSafe = /^\s*(SELECT|WITH)\b/i.test(generatedSQL);

  if (!isSafe) {
    throw new Error(
      `Truy vấn không hợp lệ hoặc có nguy cơ bảo mật: ${generatedSQL.substring(0, 100)}...`,
    );
  }

  // Trả về câu SQL sạch và an toàn để thực thi.
  return generatedSQL;
};

export default AIHandle;
