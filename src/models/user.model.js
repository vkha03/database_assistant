import pool from "../db/index.db.js";

const UserModel = {
  findAll: async () => {
    return await pool.query("SELECT * FROM users");
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id],
    );
    return rows;
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return result;
  },

  findByEmail: async (email) => {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    return rows;
  },
};

export default UserModel;
