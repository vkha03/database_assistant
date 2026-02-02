import pool from '../db/index.js';

const AuthModel = {
    login: async (email) => {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows;
    }
}

export default AuthModel;