const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error(`[${req.method}] ${req.url} - API ERROR:`, {
    message: err.message,
    stack: err.stack,
  });

  const resMessage =
    statusCode === 500 ? "Lỗi hệ thống, vui lòng thử lại sau." : err.message;

  res.status(statusCode).json({
    success: false,
    message: resMessage || "Lỗi hệ thống chưa được xác định.",
  });
};

export default errorMiddleware;
