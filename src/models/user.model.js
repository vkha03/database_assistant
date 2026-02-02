import pool from "../db/index.js";

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

  create: async (email, passwordHash) => {
    const [result] = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, passwordHash],
    );

    return result;
  },

  update: async () => {
    const [result] = await pool.query(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values,
    );

    return result;
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
