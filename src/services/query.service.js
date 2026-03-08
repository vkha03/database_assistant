import DBService from "./db.service.js";
import getPool from "../db/user.db.js";
import Crypto from "../utils/crypto.js";
import AIHandle from "./ai.service.js";

const QueryService = {
  query: async (userId, question, errMessage = "", retryCount = 0) => {
    let SQL;
    const MAX_RETRIES = 1;

    try {
      const dbInfo = await DBService.findByActive(userId);

      const generatedSQL = await AIHandle(
        question,
        dbInfo.schema_json,
        errMessage,
      );

      const password = dbInfo.db_password_encrypted
        ? Crypto.decryptPassword(dbInfo.db_password_encrypted)
        : "";

      const userPool = getPool(
        dbInfo.db_host,
        dbInfo.db_user,
        password,
        dbInfo.db_name,
      );

      SQL = generatedSQL;

      const [rows, fields] = await userPool.query(generatedSQL);

      return {
        question,
        sql: generatedSQL,
        rows,
      };
    } catch (error) {
      const isSqlError =
        error.code === "ER_PARSE_ERROR" ||
        error.code === "ER_SYNTAX_ERROR" ||
        error.code === "ER_NO_SUCH_TABLE" ||
        error.code === "ER_BAD_FIELD_ERROR";

      if (retryCount < MAX_RETRIES && isSqlError) {
        return await QueryService.query(
          userId,
          question,
          error.message,
          retryCount + 1,
        );
      }

      const statusCode = error.statusCode === 403 ? 403 : "";
      throw Object.assign(
        new Error(`Không thể xử lý câu hỏi lúc này: ${error.message}`),
        { SQL, statusCode },
      );
    }
  },
};

export default QueryService;
