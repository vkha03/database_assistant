// AUTH ROUTER: Định nghĩa các tuyến đường (routes) liên quan đến xác thực.
import Router from "express";
import AuthController from "../controllers/auth.controller.js";

const router = Router();

router.post("/google", AuthController.loginGoogle);
router.post("/refresh", AuthController.refreshToken);
router.get("/logout", AuthController.logout);

export default router;
