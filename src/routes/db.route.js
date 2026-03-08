import Router from "express";
import DBController from "../controllers/db.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import DbValidation from "../validations/db.validation.js";

const router = Router();

router.use(authMiddleware);

router.get("/", DBController.findAll);

router.get(
  "/:id",
  validate(DbValidation.idParam, "params"),
  DBController.findById,
);

router.post("/", validate(DbValidation.create, "body"), DBController.create);

router.put(
  "/:id",
  validate(DbValidation.idParam, "params"),
  validate(DbValidation.update, "body"),
  DBController.update,
);

router.delete(
  "/:id",
  validate(DbValidation.idParam, "params"),
  DBController.delete,
);

router.post("/test-connection", DBController.testConnection);
router.post("/get-schema", DBController.getSchema);
router.post("/update-schema", DBController.updateSchema);

router.patch(
  "/:id/active",
  validate(DbValidation.idParam, "params"),
  DBController.active,
);

export default router;
