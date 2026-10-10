import dotenv from 'dotenv';

dotenv.config();
export const { PORT, DB_ADDRESS, ORIGIN_ALLOW, UPLOAD_PATH, UPLOAD_PATH_TEMP } = process.env;
