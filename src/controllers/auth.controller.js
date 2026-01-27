import AuthService from '../services/auth.service.js';
import responseSuccess from '../utils/response.js';

const AuthController = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const data = await AuthService.login(email, password);
      responseSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
};

export default AuthController;
