import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import router from './routes/index.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Middleware error
app.use(errorMiddleware);

// Start server
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
