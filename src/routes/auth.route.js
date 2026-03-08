import Router from "express";
import AuthController from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";
import AuthValidation from "../validations/auth.validation.js";

const router = Router();

router.post(
  "/google",
  validate(AuthValidation.loginGoogle, "body"),
  AuthController.loginGoogle,
);

router.post(
  "/refresh",
  validate(AuthValidation.refreshToken, "cookies"),
  AuthController.refreshToken,
);

router.get("/logout", AuthController.logout);

export default router;
