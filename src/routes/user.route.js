import Router from "express";
import UserController from "../controllers/user.controller.js";
import validate from "../middlewares/validate.middleware.js";
import UserValidation from "../validations/user.validation.js";

const router = Router();

router.get("/", UserController.findAll);

router.get(
  "/:id",
  validate(UserValidation.idParam, "params"),
  UserController.findById,
);

router.get(
  "/",
  validate(UserValidation.emailParam, "body"),
  UserController.findByEmail,
);

router.delete(
  "/:id",
  validate(UserValidation.idParam, "params"),
  UserController.delete,
);

export default router;
