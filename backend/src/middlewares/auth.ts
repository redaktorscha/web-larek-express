import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import UnauthorizedError from '../errors/unauthorized-error';
import { getAccessUserId } from '../helpers/auth-tokens';
import User from '../models/user';

export const requireAuth: RequestHandler = (req, res, next) => {
  try {
    const userId = getAccessUserId(req);
    if (!mongoose.isValidObjectId(userId)) {
      throw new UnauthorizedError('Невалидный access-токен');
    }

    res.locals.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireExistingUser: RequestHandler = async (_req, res, next) => {
  try {
    const user = await User.exists({ _id: res.locals.userId });
    if (!user) {
      next(new UnauthorizedError('Пользователь не авторизован'));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
