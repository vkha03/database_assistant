// routes/dbConnection.route.js
import Router from 'express';
import DBConnectionController from '../controllers/dbConnection.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', DBConnectionController.getAll);
router.get('/:id', DBConnectionController.getById);
router.post('/', DBConnectionController.create);
router.put('/:id', DBConnectionController.update);
router.delete('/:id', DBConnectionController.delete);

// 🔥 test connection
router.post('/test-connection', DBConnectionController.testConnection);
router.post('/get-schema', DBConnectionController.getSchema);

export default router;
