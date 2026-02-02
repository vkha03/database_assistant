import DBService from "../services/db.service.js";
import successResponse from "../utils/response.js";

const DBController = {
  getAll: async (req, res, next) => {
    try {
      const rows = await DBService.findAll();

      successResponse(res, rows);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const row = await DBService.findById(req.params.id);

      successResponse(res, row);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const row = await DBService.create(req.body);

      successResponse(res, row, 201);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const row = await DBService.update(req.params.id, req.body);

      successResponse(res, row);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await DBService.delete(req.params.id);

      successResponse(res, null, 204);
    } catch (err) {
      next(err);
    }
  },

  testConnection: async (req, res, next) => {
    try {
      const userId = req.user.id;

      await DBService.testConnection(userId);

      successResponse(res, {
        connected: true,
        message: "Kết nối database thành công",
      });
    } catch (err) {
      next(err);
    }
  },

  getSchema: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const schema = await DBService.getSchema(userId);

      successResponse(res, schema);
    } catch (err) {
      next(err);
    }
  },

  active: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const id = req.params.id;

      await DBService.active(userId, id);

      successResponse(res, null, 204);
    } catch (err) {
      next(err);
    }
  },
};

export default DBController;
