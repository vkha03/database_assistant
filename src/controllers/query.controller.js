import QueryService from "../services/query.service.js";
import successResponse from "../utils/response.js";

const QueryController = {
  query: async (req, res, next) => {
    const userId = req.user.id;
    const { question } = req.body;

    const result = await QueryService.query(userId, question);

    successResponse(res, result);
  },
};

export default QueryController;
