// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        // Lấy header
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            throw Object.assign(new Error('Token không được cung cấp'), { statusCode: 401 });
        }

        // Format: "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw Object.assign(new Error('Token không hợp lệ'), { statusCode: 401 });
        }

        const token = parts[1];

        // Verify token
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Gắn thông tin user vào req để controller dùng
        req.user = payload;

        next();
    } catch (err) {
        err.statusCode = 401;
        next(err);
    }
};

export default authMiddleware;
