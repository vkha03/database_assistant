import UserService from "../services/user.service.js";
import successResponse from "../utils/response.js";

const UserController = {
  findAll: async (req, res, next) => {
    try {
      const users = await UserService.findAll();
      successResponse(res, users);
    } catch (err) {
      next(err);
    }
  },

  findById: async (req, res, next) => {
    try {
      const user = await UserService.findById(req.params.id);
      successResponse(res, user);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const newUser = await UserService.create(req.body);
      successResponse(res, newUser, 201);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const updatedUser = await UserService.update(req.params.id, req.body);
      successResponse(res, updatedUser);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await UserService.delete(req.params.id);
      successResponse(res, null, 204);
    } catch (err) {
      next(err);
    }
  },
};

export default UserController;
