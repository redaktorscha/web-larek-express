import path from 'path';
import expressWinston from 'express-winston';
import winston from 'winston';

export const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, '../../request.log') }),
  ],
  format: winston.format.json(),
  requestWhitelist: ['method', 'url', 'originalUrl'],
});

export const errorLogger = expressWinston.errorLogger({
  transports: [new winston.transports.File({ filename: path.join(__dirname, '../../error.log') })],
  format: winston.format.json(),
  requestWhitelist: ['method', 'url', 'originalUrl'],
});
