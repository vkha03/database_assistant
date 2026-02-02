import AuthService from '../services/auth.service.js';
import responseSuccess from '../utils/response.js';

const AuthController = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      responseSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  },

  register: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.register(email, password);
      responseSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
};

export default AuthController;
