import DBConnectionService from './dbConnection.service.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import mysql from 'mysql2/promise'; // Khuyên dùng mysql2/promise
import Crypto from '../utils/crypto.js'; // Giả định import

const QueryService = {
    handleQuery: async (userId, question) => {
        let connection;
        try {
            // 1. Lấy thông tin & Prompt Engineering chặt chẽ hơn
            const dbInfo = await DBConnectionService.findById(userId);

            // Prompt cần yêu cầu output format rõ ràng (JSON hoặc Plain Text only)
            // và nghiêm cấm các lệnh ghi (INSERT, UPDATE, DELETE, DROP)
            const prompt = `
Bạn là một AI SQL Generator chuyên nghiệp.
Nhiệm vụ: Chuyển đổi câu hỏi tự nhiên thành câu lệnh SQL (MySQL) dựa trên Schema.

DỮ LIỆU:
- Schema: ${JSON.stringify(dbInfo.schema_json)}
- Câu hỏi: ${question}

QUY TẮC TUYỆT ĐỐI (VI PHẠM SẼ BỊ LỖI HỆ THỐNG):
1.  **OUTPUT FORMAT:** Chỉ trả về duy nhất chuỗi SQL.
    -   KHÔNG bắt đầu bằng markdown (\`\`\`sql).
    -   KHÔNG có lời dẫn (ví dụ: "Đây là câu lệnh...").
    -   KHÔNG có comment giải thích (-- Giải thích...).
    -   Chuỗi kết quả bắt buộc phải bắt đầu ngay lập tức bằng từ khóa **SELECT** hoặc **WITH**.
    -   Mỗi cột trong kết quả phải có **alias tiếng Việt có dấu theo kiểu tiêu đề và phân cách bởi dấu cách**, rõ ràng, dễ đọc, mô tả đúng dữ liệu.
    -   Tuyệt đối phải tạo code chuẩn không bị lỗi truy vấn.
    -   Nếu cần, có thể tạo **cột tính toán (computed column)** như tổng, trung bình, tỷ lệ %, trạng thái phân loại…
2.  **LOGIC:**
    -   Tự động phát hiện ý định người dùng.
    -   Sử dụng CTE (WITH) nếu logic phức tạp.
    -   Luôn xử lý NULL (COALESCE).
    -   Không dùng số cứng (Hard-coded) cho các ngưỡng lọc (dùng AVG/LIMIT thay thế).
3.  **AN TOÀN:** Chỉ dùng câu lệnh đọc dữ liệu (SELECT).

HÃY VIẾT SQL NGAY LẬP TỨC, KHÔNG CẦN SUY NGHĨ RA LỜI:
`;
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // Lưu ý: Kiểm tra lại tên model chính xác, ví dụ "gemini-1.5-flash" hoặc "gemini-pro"
            const model = genAI.getGenerativeModel({ model: process.env.GEMINI_API_MODEL });

            const result = await model.generateContent(prompt);
            let generatedSQL = result.response.text().trim();
            // 2. Sanitization (Làm sạch Output của AI)
            // Loại bỏ markdown code blocks nếu AI vẫn cố tình thêm vào
            generatedSQL = generatedSQL.replace(/```sql|```/g, '').trim();

            // Kiểm tra an toàn sơ bộ: Chỉ cho phép bắt đầu bằng SELECT
            const isSafe = /^\s*(SELECT|WITH)\b/i.test(generatedSQL);

            if (!isSafe) {
                throw new Error(`Truy vấn không hợp lệ (Phải bắt đầu bằng SELECT hoặc WITH): ${generatedSQL.substring(0, 50)}...`);
            }
            // 3. Kết nối DB an toàn
            const password = dbInfo.db_password_encrypted ? Crypto.decryptPassword(dbInfo.db_password_encrypted) : '';

            connection = await mysql.createConnection({
                host: dbInfo.db_host,
                user: dbInfo.db_user,
                password: password,
                database: dbInfo.db_name,
                port: dbInfo.db_port
            });

            // 4. Thực thi (Execute)
            const [rows, fields] = await connection.query(generatedSQL);

            return {
                question,
                sql: generatedSQL,
                data: rows
            };

        } catch (error) {
            console.error("QueryService Error:", error);
            // Tùy chỉnh return lỗi cho FE
            throw new Error("Không thể xử lý câu hỏi lúc này: " + error.message);
        } finally {
            // 5. QUAN TRỌNG: Luôn đóng kết nối
            if (connection) {
                await connection.end();
            }
        }
    }
};

export default QueryService;