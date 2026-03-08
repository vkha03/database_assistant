import "dotenv/config";

const dbConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || "127.0.0.1",
  dialect: "mysql",
};

export default {
  development: {
    ...dbConfig,
    database: process.env.DB_NAME || "database_assistant",
  },
  test: {
    ...dbConfig,
    database: process.env.DB_NAME || "database_test",
  },
  production: {
    ...dbConfig,
  },
};
