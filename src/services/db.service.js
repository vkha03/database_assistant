import AppError from "../utils/error.util.js";
import mysql from "mysql2/promise";
import Crypto from "../utils/crypto.util.js";
import normallizeSchema from "../utils/normallize.util.js";
import DBModel from "../models/db.model.js";

const DBService = {
  getConnection: async (userId) => {
    const dbInfo = await DBService.findByActive(userId);

    const password = dbInfo.db_password_encrypted
      ? Crypto.decryptPassword(dbInfo.db_password_encrypted)
      : "";

    try {
      const connection = await mysql.createConnection({
        host: dbInfo.db_host,
        user: dbInfo.db_user,
        password,
        database: dbInfo.db_name,
        port: dbInfo.db_port,
        connectTimeout: 5000,
      });

      return { connection, dbName: dbInfo.db_name };
    } catch (err) {
      throw new AppError(
        `Sai cấu hình database hoặc hệ thống đang lỗi, vui lòng thử lại!: ${err}`,
        404,
      );
    }
  },

  findAll: async () => await DBModel.findAll(),

  findById: async (id) => {
    const data = await DBModel.findById(id);
    if (!data) throw new AppError("Không tìm thấy kết nối DB", 404);
    return data;
  },

  findByActive: async (userId) => {
    const data = await DBModel.findByActive(userId);
    if (!data) throw new AppError("Không tìm thấy kết nối DB", 404);

    return data;
  },

  create: async (userId, data) => {
    const { db_host, db_port, db_name, db_user, db_password } = data;

    const encryptedPassword = Crypto.encryptPassword(db_password);
    const result = await DBModel.create(
      userId,
      db_host,
      db_port,
      db_name,
      db_user,
      encryptedPassword,
    );

    return { id: result.insertId, userId, db_host, db_port, db_name, db_user };
  },

  update: async (id, updates) => {
    const filtered = { ...updates };

    if (filtered.db_password !== undefined) {
      filtered.db_password_encrypted = Crypto.encryptPassword(
        filtered.db_password,
      );
      delete filtered.db_password;
    }

    const result = await DBModel.update(id, filtered);

    if (!result || result.affectedRows === 0) {
      throw new AppError("Không tìm thấy kết nối DB để cập nhật", 404);
    }

    return true;
  },

  delete: async (id) => {
    const result = await DBModel.delete(id);
    if (result.affectedRows === 0)
      throw new AppError("Không tìm thấy kết nối DB", 404);

    return true;
  },

  testConnection: async (userId) => {
    const { connection } = await DBService.getConnection(userId);

    try {
      await connection.execute("SELECT 1");
      return true;
    } catch (err) {
      throw new AppError("Không thể kết nối tới database khách hàng", 400);
    } finally {
      await connection.end();
    }
  },

  getSchema: async (userId) => {
    const { connection, dbName } = await DBService.getConnection(userId);

    try {
      const result = await DBModel.getSchema(connection, dbName);
      return normallizeSchema(result);
    } catch (err) {
      throw new AppError("Không thể lấy được cấu trúc database", 400);
    } finally {
      await connection.end();
    }
  },

  updateSchema: async (userId) => {
    const newSchema = await DBService.getSchema(userId);

    try {
      await DBModel.updateSchema(newSchema, userId);
      return newSchema;
    } catch (err) {
      throw new AppError("Không thể cập nhật cấu trúc database", 500);
    }
  },

  active: async (userId, id) => {
    await DBModel.unActive(userId);
    const active = await DBModel.active(userId, id);
    if (active.affectedRows === 0)
      throw new AppError("Không tìm thấy kết nối DB", 404);

    return true;
  },
};

export default DBService;
