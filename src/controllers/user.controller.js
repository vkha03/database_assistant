import UserService from "../services/user.service.js";
import successResponse from "../utils/response.js";

const UserController = {
  findAll: async (req, res, next) => {
    const users = await UserService.findAll();
    successResponse(res, users);
  },

  findById: async (req, res, next) => {
    const user = await UserService.findById(req.params.id);
    successResponse(res, user);
  },

  findByEmail: async (req, res, next) => {
    const user = await UserService.findByEmail(req.body.email);
    successResponse(res, user);
  },

  delete: async (req, res, next) => {
    await UserService.delete(req.params.id);
    successResponse(res, null, 204);
  },
};

export default UserController;
