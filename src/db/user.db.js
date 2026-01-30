import mysql from 'mysql2/promise';

const userPool = {}; // Bạn đặt tên là userPool

export default (host, user, password = '', database) => {
    // Lỗi 1: biến truyền vào là 'user', nhưng bạn dùng 'username' ở đây
    const poolKey = `${host}_${database}_${user}`;

    if (userPool[poolKey]) return userPool[poolKey];

    const newPool = mysql.createPool({
        host,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Lỗi 2: bạn dùng tên 'pools', phải sửa thành 'userPool' cho khớp với khai báo trên đầu
    userPool[poolKey] = newPool;

    return newPool;
}