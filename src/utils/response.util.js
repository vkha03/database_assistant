const successResponse = (
  res,
  message = null,
  data = null,
  statusCode = 200,
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export default successResponse;
