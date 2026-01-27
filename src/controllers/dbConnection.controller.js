import DBConnectionService from '../services/dbConnection.service.js';
import successResponse from '../utils/response.js';

const DBConnectionController = {
    getAll: async (req, res, next) => {
        try {
            const rows = await DBConnectionService.findAll();
            successResponse(res, rows);
        } catch (err) {
            next(err);
        }
    },

    getById: async (req, res, next) => {
        try {
            const row = await DBConnectionService.findById(req.params.id);
            successResponse(res, row);
        } catch (err) {
            next(err);
        }
    },

    create: async (req, res, next) => {
        try {
            const row = await DBConnectionService.create(req.body);
            successResponse(res, row, 201);
        } catch (err) {
            next(err);
        }
    },

    update: async (req, res, next) => {
        try {
            const row = await DBConnectionService.update(req.params.id, req.body);
            successResponse(res, row);
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            await DBConnectionService.delete(req.params.id);
            successResponse(res, null, 204);
        } catch (err) {
            next(err);
        }
    },

    // ✅ TEST CONNECTION
    testConnection: async (req, res, next) => {
        try {
            const userId = req.user.id; // từ authMiddleware
            await DBConnectionService.testConnection(userId);

            successResponse(res, {
                connected: true,
                message: 'Kết nối database thành công'
            });
        } catch (err) {
            next(err);
        }
    },

    getSchema: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const schema = await DBConnectionService.getSchema(userId);
            successResponse(res, schema);
        } catch (err) {
            next(err);
        }
    }
};

export default DBConnectionController;
