import AppError from "../utils/error.util.js";
import UserModel from "../models/user.model.js";

const UserService = {
  findAll: async () => {
    return await UserModel.findAll();
  },

  findById: async (id) => {
    const rows = await UserModel.findById(id);

    if (!rows || rows.length === 0) {
      throw new AppError("Không tìm thấy người dùng", 404);
    }

    return rows[0];
  },

  delete: async (id) => {
    const result = await UserModel.delete(id);

    if (result.affectedRows === 0) {
      throw new AppError("Không tìm thấy người dùng để xóa", 404);
    }

    return true;
  },

  findByEmail: async (email) => {
    const rows = await UserModel.findByEmail(email);
    if (!rows || rows.length === 0) {
      throw new AppError("Không tìm thấy người dùng", 404);
    }

    return rows[0];
  },
};

export default UserService;
