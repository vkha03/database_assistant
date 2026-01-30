// ==============================================================================
// 1. KHAI BÁO CÁC THƯ VIỆN CẦN DÙNG (DEPENDENCIES)
// ==============================================================================

// Nạp biến môi trường từ file .env (ví dụ: mật khẩu DB, số cổng PORT)
// -> Giúp bảo mật thông tin, không lộ code cứng ra ngoài.
import 'dotenv/config';

// Import Express: Đây là framework chính để tạo Server (giống như xương sống của ứng dụng).
import express from 'express';

// Import Morgan: Công cụ ghi lại nhật ký (log) mỗi khi có ai đó gửi request vào server.
// -> Giúp mình biết server đang chạy gì, có lỗi gì không.
import morgan from 'morgan';

// Import CORS: Cơ chế bảo mật trình duyệt.
// -> Cho phép Frontend chạy ở link khác (VD: localhost:5173) 
//    có thể gọi API vào Server này (localhost:3000).
import cors from 'cors';


// ==============================================================================
// 2. KHAI BÁO CÁC MODULE TỰ VIẾT (LOCAL MODULES)
// ==============================================================================

// Import bộ định tuyến (Router): Nơi chứa danh sách các đường dẫn API (VD: /users, /products).
import router from './routes/index.js';

// Import bộ xử lý lỗi chung: Nếu code bị lỗi ở đâu đó, nó sẽ nhảy về đây để báo lỗi đẹp hơn.
import errorMiddleware from './middlewares/error.middleware.js';


// ==============================================================================
// 3. KHỞI TẠO SERVER
// ==============================================================================

const app = express(); // Tạo một "app" (ứng dụng) web server
// Lấy cổng chạy server từ file .env, nếu không có thì mặc định chạy cổng 3000
const port = process.env.PORT || 3000;


// ==============================================================================
// 4. CẤU HÌNH MIDDLEWARE (CÁC BƯỚC XỬ LÝ TRUNG GIAN)
// Middleware giống như các trạm kiểm soát, request phải đi qua đây trước khi vào xử lý chính.
// ==============================================================================

app.use(morgan('dev')); // Bật chế độ log để theo dõi request trong Terminal khi code.
app.use(cors()); // Mở cửa cho phép các nguồn khác gọi API (tránh lỗi chặn CORS ở Frontend).

// Hai dòng dưới cực kỳ quan trọng: Giúp Server "đọc hiểu" dữ liệu Frontend gửi lên.
// Nếu không có, khi Frontend gửi form, Server sẽ nhận được rỗng (undefined).
app.use(express.json()); // Đọc dữ liệu dạng JSON (thường dùng khi gọi API).
app.use(express.urlencoded({ extended: true })); // Đọc dữ liệu dạng Form HTML chuẩn.


// ==============================================================================
// 5. ĐỊNH TUYẾN (ROUTES)
// ==============================================================================

// Gắn router vào đường dẫn gốc '/api'.
// Ví dụ: Nếu trong router có '/login', thì đường dẫn đầy đủ sẽ là: http://localhost:3000/api/login
app.use('/api', router);


// ==============================================================================
// 6. XỬ LÝ LỖI (ERROR HANDLING)
// ==============================================================================

// Middleware này PHẢI đặt cuối cùng, sau tất cả các routes.
// Nếu không tìm thấy route nào hoặc code bị lỗi, nó sẽ rơi xuống đây để xử lý.
app.use(errorMiddleware);


// ==============================================================================
// 7. CHẠY SERVER
// ==============================================================================

app.listen(port, () => {
    // In ra link để mọi người trong team click vào test cho lẹ
    console.log(`🚀 Server đang chạy ngon lành tại: http://localhost:${port}`);
});