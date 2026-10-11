import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import { Joi } from 'celebrate';
import mongoose from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import User, { IUser } from '../models/user';
import {
  clearRefreshCookie,
  createTokenPair,
  getRefreshToken,
  getRefreshUserId,
  setRefreshCookie,
} from '../helpers/auth-tokens';

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(30),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).required();

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

const publicUser = (user: IUser) => ({ name: user.name, email: user.email });

export const register: RequestHandler = async (req, res, next) => {
  const { error: validationError, value } = registerSchema.validate(req.body, { convert: false });
  if (validationError) {
    next(new BadRequestError('Некорректные данные регистрации'));
    return;
  }

  const { name, password } = value;
  const email = value.email.trim().toLowerCase();

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.init();
    const user = new User({ name, email, password: passwordHash });
    const { accessToken, refreshToken } = createTokenPair(String(user._id));
    user.tokens.push({ token: refreshToken });
    await user.save();

    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user: publicUser(user), success: true, accessToken });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      next(new BadRequestError('Некорректные данные регистрации'));
      return;
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      next(new ConflictError('Пользователь с таким email уже существует'));
      return;
    }
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  const { error: validationError, value } = loginSchema.validate(req.body, { convert: false });
  if (validationError) {
    next(new BadRequestError('Некорректные данные входа'));
    return;
  }

  try {
    const user = await User.findOne({ email: value.email.trim().toLowerCase() }).select(
      '+password +tokens'
    );
    if (!user || !(await bcrypt.compare(value.password, user.password))) {
      next(new UnauthorizedError('Неверная почта или пароль'));
      return;
    }

    const { accessToken, refreshToken } = createTokenPair(String(user._id));
    user.tokens.push({ token: refreshToken });
    await user.save();

    setRefreshCookie(res, refreshToken);
    res.json({ user: publicUser(user), success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser: RequestHandler = async (_req, res, next) => {
  try {
    const userId = res.locals.userId as string;
    const user = await User.findById(userId);
    if (!user) {
      next(new NotFoundError('Пользователь не найден'));
      return;
    }

    res.json({ user: publicUser(user), success: true });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken: RequestHandler = async (req, res, next) => {
  try {
    const oldRefreshToken = getRefreshToken(req);
    const userId = getRefreshUserId(oldRefreshToken);
    if (!mongoose.isValidObjectId(userId)) {
      next(new UnauthorizedError('Невалидный refresh-токен'));
      return;
    }

    const { accessToken, refreshToken } = createTokenPair(userId);
    const user = await User.findOneAndUpdate(
      { _id: userId, 'tokens.token': oldRefreshToken },
      { $set: { 'tokens.$.token': refreshToken } },
      { new: true }
    );
    if (!user) {
      next(new UnauthorizedError('Невалидный refresh-токен'));
      return;
    }

    setRefreshCookie(res, refreshToken);
    res.json({ user: publicUser(user), success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = getRefreshToken(req);
    const userId = getRefreshUserId(refreshToken);
    if (!mongoose.isValidObjectId(userId)) {
      next(new BadRequestError('Некорректный идентификатор пользователя'));
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      next(new NotFoundError('Пользователь не найден'));
      return;
    }

    const result = await User.updateOne(
      { _id: userId, 'tokens.token': refreshToken },
      { $pull: { tokens: { token: refreshToken } } }
    );
    if (!result.modifiedCount) {
      next(new UnauthorizedError('Невалидный refresh-токен'));
      return;
    }

    clearRefreshCookie(res);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
