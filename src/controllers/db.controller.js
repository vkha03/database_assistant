import DBService from "../services/db.service.js";
import successResponse from "../utils/response.util.js";

const DBController = {
  findAll: async (req, res, next) => {
    const rows = await DBService.findAll();
    successResponse(res, rows);
  },

  findById: async (req, res, next) => {
    const row = await DBService.findById(req.params.id);
    successResponse(res, row);
  },

  create: async (req, res, next) => {
    const userId = req.user.id;
    const row = await DBService.create(userId, req.body);
    successResponse(res, row, 201);
  },

  update: async (req, res, next) => {
    const row = await DBService.update(req.params.id, req.body);
    successResponse(res, row);
  },

  delete: async (req, res, next) => {
    await DBService.delete(req.params.id);
    successResponse(res, null, 204);
  },

  testConnection: async (req, res, next) => {
    const userId = req.user.id;
    await DBService.testConnection(userId);

    successResponse(res, {
      connected: true,
      message: "Kết nối database khách hàng thành công!",
    });
  },

  getSchema: async (req, res, next) => {
    const userId = req.user.id;
    const schema = await DBService.getSchema(userId);
    successResponse(res, schema);
  },

  updateSchema: async (req, res, next) => {
    const userId = req.user.id;
    const schema = await DBService.updateSchema(userId);

    successResponse(res, schema);
  },

  active: async (req, res, next) => {
    const userId = req.user.id;
    const id = req.params.id;

    await DBService.active(userId, id);
    successResponse(res, null, 204);
  },
};

export default DBController;
