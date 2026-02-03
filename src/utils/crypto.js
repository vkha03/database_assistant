// CRYPTO UTILITY: Mã hóa và Giải mã dữ liệu nhạy cảm (Mật khẩu Database).
import crypto from "crypto";

// 1. Cấu hình thuật toán: AES-256 chuẩn mã hóa cao cấp của quân đội Mỹ.
const ALGORITHM = "aes-256-ecb";

// 2. Tạo khóa bảo mật (Encryption Key):
// Do thuật toán yêu cầu Key phải đúng 32 bytes, ta dùng SHA256 để băm chuỗi bí mật từ .env.
// Điều này đảm bảo dù DB_SECRET_KEY dài hay ngắn thì kết quả cuối cùng luôn là 32 bytes chuẩn.
const KEY = crypto
  .createHash("sha256")
  .update(process.env.DB_SECRET_KEY)
  .digest();

const Crypto = {
  // 3. Hàm Mã hóa (Encrypt): Chuyển văn bản thuần thành chuỗi ký tự khó hiểu.
  // Ví dụ: "123456" -> "a7b8c9..."
  encryptPassword: (text) => {
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, null);
    return cipher.update(text, "utf8", "hex") + cipher.final("hex");
  },

  // 4. Hàm Giải mã (Decrypt): Chuyển chuỗi đã mã hóa ngược lại về văn bản gốc.
  // Dùng khi Server cần lấy mật khẩu thật để kết nối vào Database khách hàng.
  decryptPassword: (encrypted) => {
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, null);
    return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
  },
};

export default Crypto;
