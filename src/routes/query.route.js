import Router from 'express';
import QueryController from '../controllers/query.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// Tất cả query đều cần login
router.use(authMiddleware);

/**
 * POST /api/query
 * Body:
 * {
 *   "question": "Liệt kê danh sách khách hàng"
 * }
 */
router.post('/', QueryController.ask);

export default router;
