export default function normalizeSchema(rows) {
    const schema = {};

    // Hàm lấy giá trị không phân biệt hoa thường
    const get = (row, key) => row[key] || row[key.toUpperCase()];

    for (const r of rows) {
        const tableName = get(r, 'table_name');
        if (!tableName) continue;

        if (!schema[tableName]) {
            schema[tableName] = {
                description: `Table ${tableName}`,
                columns: []
            };
        }

        const colName = get(r, 'column_name');
        const colType = get(r, 'column_type');
        const colKey = get(r, 'column_key');
        const refTable = get(r, 'referenced_table_name');
        const refCol = get(r, 'referenced_column_name');
        const comment = get(r, 'column_comment');

        // Tạo dòng mô tả cột cực kỳ chi tiết cho AI
        let colDesc = `${colName} (${colType})`;

        if (colKey === 'PRI') colDesc += ' [PK]'; // Khóa chính

        // Nếu có refTable nghĩa là có Quan hệ (Foreign Key)
        if (refTable) {
            colDesc += ` [FK -> ${refTable}.${refCol}]`;
        }

        if (comment) colDesc += ` -- ${comment}`;

        schema[tableName].columns.push(colDesc);
    }

    return schema;
}
