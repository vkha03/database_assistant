import QueryService from '../services/query.service.js';
import successResponse from '../utils/response.js';

const QueryController = {
    ask: async (req, res, next) => {
        try {
            const userId = req.user.id; // lấy từ JWT
            const { question } = req.body;

            if (!question) {
                throw Object.assign(
                    new Error('Câu hỏi không được để trống'),
                    { statusCode: 400 }
                );
            }

            const result = await QueryService.handleQuery(userId, question);

            successResponse(res, result);
        } catch (err) {
            next(err);
        }
    }
};

export default QueryController;
