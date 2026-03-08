import Router from "express";
import QueryController from "../controllers/query.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import QueryValidation from "../validations/query.validation.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(QueryValidation.ask, "body"), QueryController.query);

export default router;
