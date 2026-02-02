import mysql from "mysql2/promise";

const userPool = {}; // Bạn đặt tên là userPool

export default (host, user, password = "", database) => {
  const poolKey = `${host}_${database}_${user}`;

  if (userPool[poolKey]) return userPool[poolKey];

  const newPool = mysql.createPool({
    host,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  userPool[poolKey] = newPool;

  return newPool;
};
