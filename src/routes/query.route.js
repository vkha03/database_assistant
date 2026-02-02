import Router from "express";
import QueryController from "../controllers/query.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/query", QueryController.query);

export default router;
