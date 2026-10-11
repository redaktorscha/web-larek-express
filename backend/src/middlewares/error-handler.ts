import { ErrorRequestHandler } from 'express';
import multer from 'multer';

const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const malformedJson = error instanceof SyntaxError && 'body' in error;
  const statusCode =
    malformedJson || error instanceof multer.MulterError ? 400 : error.statusCode || 500;
  let { message } = error;

  if (statusCode === 500) {
    message = 'На сервере произошла ошибка';
  } else if (malformedJson) {
    message = 'Некорректный JSON в теле запроса';
  }

  res.status(statusCode).json({ message });
};

export default errorHandler;
