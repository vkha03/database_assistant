// routes/dbConnection.route.js
import Router from 'express';
import DBController from '../controllers/db.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', DBController.getAll);
router.get('/:id', DBController.getById);
router.post('/', DBController.create);
router.put('/:id', DBController.update);
router.delete('/:id', DBController.delete);

// 🔥 test connection
router.post('/test-connection', DBController.testConnection);
router.post('/get-schema', DBController.getSchema);

export default router;
