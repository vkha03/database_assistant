import databaseService from '../services/database.service.js';
import successResponse from '../utils/response.js';

const DatabaseController = {

  /**
   * @description Get all database connections for the logged-in user
   */
  getAllDatabases: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const databases = await databaseService.findAllByUserId(userId);
      successResponse(res, databases);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @description Get a single database connection by its ID
   */
  getDatabaseById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const database = await databaseService.findById(id, userId);
      successResponse(res, database);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @description Create a new database connection
   */
  createDatabase: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const dbData = { ...req.body, user_id: userId };
      const newDatabase = await databaseService.create(dbData);
      successResponse(res, newDatabase, 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @description Update an existing database connection
   */
  updateDatabase: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updatedDatabase = await databaseService.update(id, userId, req.body);
      successResponse(res, updatedDatabase);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @description Delete a database connection
   */
  deleteDatabase: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await databaseService.delete(id, userId);
      successResponse(res, null, 204);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @description Test database connection
   */
  testDatabaseConnection: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await databaseService.testConnection(id, userId);
      successResponse(res, { connected: true });
    } catch (err) {
      next(err);
    }
  }
};

export default DatabaseController;
