import pool from "../db/index.js";

const DBModel = {
  findAll: async () => {
    const [rows] = await pool.query(
      "SELECT id, user_id, db_host, db_port, db_name, db_user, schema_json, is_active, created_at, updated_at FROM user_databases",
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      "SELECT * FROM user_databases WHERE id = ?",
      [id],
    );
    return rows[0];
  },

  findByActive: async (userId) => {
    const [rows] = await pool.query(
      "SELECT * FROM user_databases WHERE user_id = ? AND is_active = 1",
      [userId],
    );
    return rows[0];
  },

  create: async (
    user_id,
    db_host,
    db_port,
    db_name,
    db_user,
    encryptedPassword,
  ) => {
    const [result] = await pool.query(
      `INSERT INTO user_databases 
       (user_id, db_host, db_port, db_name, db_user, db_password_encrypted) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, db_host, db_port, db_name, db_user, encryptedPassword],
    );
    return result;
  },

  update: async (id, updates) => {
    const allowedColumns = [
      "db_host",
      "db_port",
      "db_name",
      "db_user",
      "db_password_encrypted",
      "is_active",
      "schema_json",
    ];

    const keys = Object.keys(updates).filter((key) =>
      allowedColumns.includes(key),
    );

    if (keys.length === 0) return null;
    const fields = keys.map((key) => `\`${key}\` = ?`).join(", ");

    const values = [...keys.map((key) => updates[key]), id];

    const [result] = await pool.query(
      `UPDATE user_databases SET ${fields} WHERE id = ?`,
      values,
    );

    return result;
  },

  delete: async (id) => {
    const [result] = await pool.query(
      "DELETE FROM user_databases WHERE id = ?",
      [id],
    );
    return result;
  },

  updateSchema: async (newSchema, userId) => {
    const result = await pool.query(
      `UPDATE user_databases SET schema_json = ? WHERE user_id = ? AND is_active = 1`,
      [JSON.stringify(newSchema), userId],
    );
    return result;
  },

  getSchema: async (connection, dbName) => {
    const [rows] = await connection.query(
      `
SELECT 
    c.TABLE_NAME, 
    c.COLUMN_NAME, 
    c.COLUMN_TYPE, 
    c.COLUMN_KEY, 
    c.COLUMN_COMMENT,
    k.REFERENCED_TABLE_NAME, 
    k.REFERENCED_COLUMN_NAME
FROM information_schema.COLUMNS c
LEFT JOIN information_schema.KEY_COLUMN_USAGE k 
    ON c.TABLE_SCHEMA = k.TABLE_SCHEMA 
    AND c.TABLE_NAME = k.TABLE_NAME 
    AND c.COLUMN_NAME = k.COLUMN_NAME
WHERE c.TABLE_SCHEMA = ?
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;
        `,
      [dbName],
    );
    return rows;
  },

  unActive: async (userId) => {
    const [result] = await pool.query(
      "UPDATE user_databases SET is_active = 0 WHERE user_id = ?",
      [userId],
    );
    return result;
  },

  active: async (userId, id) => {
    const [result] = await pool.query(
      "UPDATE user_databases SET is_active = 1 WHERE user_id = ? AND id = ?",
      [userId, id],
    );
    return result;
  },
};

export default DBModel;
