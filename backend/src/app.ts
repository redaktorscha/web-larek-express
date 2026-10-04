import express from 'express';
import cors from 'cors';
import { PORT, ORIGIN_ALLOW } from './helpers/config';

const app = express();
app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
