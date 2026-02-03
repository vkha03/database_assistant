// SUCCESS RESPONSE HELPER: Chuẩn hóa định dạng phản hồi thành công cho toàn hệ thống.

export default (res, data, statusCode = 200) => {
  // 1. HTTP Status Code: Mặc định 200 (OK). Ví dụ: 201 cho "Tạo mới thành công".
  res.status(statusCode).json({
    // 2. Status Flag: Cờ hiệu giúp Frontend xác định nhanh trạng thái logic.
    status: "success",

    // 3. Data Payload: Dữ liệu nghiệp vụ thực tế trả về.
    // Ví dụ: data có thể là một Object { id: 1 } hoặc mảng [ { id: 1 }, { id: 2 } ].
    data,
  });
};
