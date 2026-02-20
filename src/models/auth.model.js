import pool from "../db/index.js";

const AuthModel = {
  // --- LIÊN QUAN TỚI USER ---
  findUserByGoogleId: async (googleId) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE google_id = ?", [
      googleId,
    ]);
    return rows[0]; // Trả về user đầu tiên hoặc undefined
  },

  // Thêm vào auth.model.js
  findUserById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },

  createUserGoogle: async (googleId, email) => {
    const [result] = await pool.query(
      "INSERT INTO users (google_id, email, role) VALUES (?, ?, 'user')",
      [googleId, email],
    );
    return result.insertId; // Trả về ID của user vừa tạo
  },

  // --- LIÊN QUAN TỚI REFRESH TOKEN ---
  saveRefreshToken: async (userId, token, expiresAt) => {
    await pool.query(
      "REPLACE INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expiresAt],
    );
  },

  findRefreshToken: async (token) => {
    const [rows] = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = ?",
      [token],
    );
    return rows[0];
  },

  deleteRefreshTokenById: async (id) => {
    await pool.query("DELETE FROM refresh_tokens WHERE id = ?", [id]);
  },

  deleteRefreshTokenByToken: async (token) => {
    await pool.query("DELETE FROM refresh_tokens WHERE token = ?", [token]);
  },
};

export default AuthModel;
