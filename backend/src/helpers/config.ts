import dotenv from 'dotenv';

dotenv.config();
export const PORT = process.env.PORT;
export const DB_ADDRESS = process.env.DB_ADDRESS;
export const ORIGIN_ALLOW = process.env.ORIGIN_ALLOW;
export const UPLOAD_PATH = process.env.UPLOAD_PATH;
export const UPLOAD_PATH_TEMP = process.env.UPLOAD_PATH_TEMP;
