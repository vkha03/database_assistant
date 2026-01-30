import { GoogleGenerativeAI } from "@google/generative-ai";
import promptAI from '../utils/prompt.js';

const AIHandle = async (question, schema) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Lưu ý: Kiểm tra lại tên model chính xác, ví dụ "gemini-1.5-flash" hoặc "gemini-pro"
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_API_MODEL });
    const prompt = promptAI(question, schema);
    const result = await model.generateContent(prompt);

    // Prompt cần yêu cầu output format rõ ràng (JSON hoặc Plain Text only)
    // và nghiêm cấm các lệnh ghi (INSERT, UPDATE, DELETE, DROP)
    let generatedSQL = result.response.text().trim();
    // 2. Sanitization (Làm sạch Output của AI)
    // Loại bỏ markdown code blocks nếu AI vẫn cố tình thêm vào
    generatedSQL = generatedSQL.replace(/```sql|```/g, '').trim();

    // Kiểm tra an toàn sơ bộ: Chỉ cho phép bắt đầu bằng SELECT
    const isSafe = /^\s*(SELECT|WITH)\b/i.test(generatedSQL);

    if (!isSafe) {
        throw new Error(`Truy vấn không hợp lệ (Phải bắt đầu bằng SELECT hoặc WITH): ${generatedSQL.substring(0, 100)}...`);
    }

    return generatedSQL;
}

export default AIHandle;