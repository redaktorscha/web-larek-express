import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { errors } from 'celebrate';
import { PORT, ORIGIN_ALLOW, DB_ADDRESS } from './helpers/config';
import productRouter from './routes/product';
import orderRouter from './routes/order';

const app = express();
app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use(errors());

mongoose.connect(String(DB_ADDRESS));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
