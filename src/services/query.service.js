import DBService from './db.service.js';
import getPool from '../db/user.db.js';
import Crypto from '../utils/crypto.js'; // Giả định import
import AIHandle from './ai.service.js';

const QueryService = {
    handleQuery: async (userId, question) => {
        let SQL;

        try {
            // 1. Lấy thông tin & Prompt Engineering chặt chẽ hơn
            const dbInfo = await DBService.findById(userId);

            const generatedSQL = await AIHandle(question, dbInfo.schema_json);

            // 3. Kết nối DB an toàn
            const password = dbInfo.db_password_encrypted ? Crypto.decryptPassword(dbInfo.db_password_encrypted) : '';

            const userPool = getPool(dbInfo.db_host, dbInfo.db_user, password, dbInfo.db_name);

            SQL = generatedSQL;
            // 4. Thực thi (Execute)
            const [rows, fields] = await userPool.query(generatedSQL);

            return {
                question,
                sql: generatedSQL,
                data: rows
            };

        } catch (error) {
            console.error("QueryService Error:", error);
            // Tùy chỉnh return lỗi cho FE
            // throw new Error(`Không thể xử lý câu hỏi lúc này: ${error.message}`).SQL(`${SQL}`);
            throw Object.assign(
                new Error(`Không thể xử lý câu hỏi lúc này: ${error.message}`),
                { SQL });
        }
    }
};

export default QueryService;