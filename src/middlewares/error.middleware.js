export default (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error("LỖI TẠI CONTROLLER:", err);

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi Server'
    });
};
