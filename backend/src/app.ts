import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';
import { PORT, ORIGIN_ALLOW, DB_ADDRESS } from './helpers/config';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import NotFoundError from './errors/not-found-error';
import errorHandler from './middlewares/error-handler';
import { errorLogger, requestLogger } from './middlewares/logger';
import authRouter from './router/auth';

const app = express();
app.use(requestLogger);
app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/auth', authRouter);
app.use((_req, _res, next) => next(new NotFoundError('Маршрут не найден')));
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

mongoose.connect(String(DB_ADDRESS));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
