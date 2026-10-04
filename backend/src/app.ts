import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { PORT, ORIGIN_ALLOW, DB_ADDRESS } from './helpers/config';

const app = express();
app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(String(DB_ADDRESS));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
