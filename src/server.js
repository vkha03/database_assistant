import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
