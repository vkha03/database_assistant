import Router from 'express';
import userRoute from './user.route.js';
import authRoute from './auth.route.js';
import dbConnectionRoute from './dbConnection.route.js';
import queryRoute from './query.route.js';


const router = Router();

router.use('/users', userRoute);
router.use('/auth', authRoute);
router.use('/database', dbConnectionRoute);
router.use('/query', queryRoute);


export default router;
