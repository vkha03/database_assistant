import Router from 'express';
import userRoute from './user.route.js';
import authRoute from './auth.route.js';
import dbRoute from './db.route.js';
import queryRoute from './query.route.js';


const router = Router();

router.use('/users', userRoute);
router.use('/auth', authRoute);
router.use('/database', dbRoute);
router.use('/query', queryRoute);


export default router;
