// NORMALIZE SCHEMA UTILITY: Chuyển đổi dữ liệu thô từ Database thành định dạng AI dễ hiểu.
// Mục tiêu: Biến các bảng dữ liệu phức tạp thành một bản đồ (JSON) ngắn gọn cho AI đọc.

export default function normalizeSchema(rows) {
  const schema = {};

  // 1. Helper Function: Lấy giá trị không phân biệt chữ hoa/thường.
  // Vì một số DB trả về 'TABLE_NAME' (viết hoa), số khác lại là 'table_name'.
  const get = (row, key) => row[key] || row[key.toUpperCase()];

  for (const r of rows) {
    const tableName = get(r, "table_name");
    if (!tableName) continue;

    // 2. Khởi tạo cấu trúc cho Table nếu chưa tồn tại
    if (!schema[tableName]) {
      schema[tableName] = {
        description: `Table ${tableName}`,
        columns: [],
      };
    }

    // 3. Trích xuất các thuộc tính quan trọng của cột (Column)
    const colName = get(r, "column_name"); // Tên cột (VD: id, user_id)
    const colType = get(r, "column_type"); // Kiểu dữ liệu (VD: int, varchar)
    const colKey = get(r, "column_key"); // Khóa (VD: PRI là khóa chính)
    const refTable = get(r, "referenced_table_name"); // Bảng liên kết (Khóa ngoại)
    const refCol = get(r, "referenced_column_name"); // Cột liên kết
    const comment = get(r, "column_comment"); // Chú thích của Dev trong DB

    // 4. Xây dựng "Dòng mô tả kỹ thuật" cho AI
    // Mục đích: Cung cấp đủ thông tin để AI biết cách viết câu lệnh JOIN chính xác.
    // Ví dụ kết quả: "user_id (int) [FK -> users.id] -- ID của người dùng"
    let colDesc = `${colName} (${colType})`;

    if (colKey === "PRI") colDesc += " [PK]"; // Đánh dấu Khóa chính (Primary Key)

    // Nếu có refTable nghĩa là đây là Khóa ngoại (Foreign Key)
    // Đây là thông tin cực kỳ giá trị để AI biết các bảng nối (JOIN) với nhau thế nào.
    if (refTable) {
      colDesc += ` [FK -> ${refTable}.${refCol}]`;
    }

    if (comment) colDesc += ` -- ${comment}`;

    // 5. Đẩy thông tin cột vào danh sách của bảng tương ứng
    schema[tableName].columns.push(colDesc);
  }

  return schema;
}
