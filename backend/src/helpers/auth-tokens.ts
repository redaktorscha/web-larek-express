import { randomUUID } from 'crypto';
import { CookieOptions, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import UnauthorizedError from '../errors/unauthorized-error';
import {
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_ACCESS_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_SECRET,
} from './config';

if (!AUTH_ACCESS_TOKEN_SECRET || !AUTH_REFRESH_TOKEN_SECRET) {
  throw new Error('Не заданы секреты для подписи токенов');
}

const accessSecret = AUTH_ACCESS_TOKEN_SECRET;
const refreshSecret = AUTH_REFRESH_TOKEN_SECRET;

const getLifetime = (value: string, name: string): number => {
  const lifetime = ms(value as ms.StringValue);
  if (!Number.isFinite(lifetime) || lifetime < 1000) {
    throw new Error(`Некорректное время жизни ${name}`);
  }
  return lifetime;
};

const accessLifetime = getLifetime(AUTH_ACCESS_TOKEN_EXPIRY || '10m', 'access-токена');
const refreshLifetime = getLifetime(AUTH_REFRESH_TOKEN_EXPIRY || '7d', 'refresh-токена');

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: refreshLifetime,
  path: '/',
};

export const createTokenPair = (userId: string) => ({
  accessToken: jwt.sign({ _id: userId }, accessSecret, {
    algorithm: 'HS256',
    expiresIn: Math.floor(accessLifetime / 1000),
    keyid: randomUUID(),
  }),
  refreshToken: jwt.sign({ _id: userId }, refreshSecret, {
    algorithm: 'HS256',
    expiresIn: Math.floor(refreshLifetime / 1000),
    keyid: randomUUID(),
  }),
});

const verifyToken = (token: string, secret: string): string => {
  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (typeof payload !== 'object' || typeof payload._id !== 'string') {
      throw new UnauthorizedError('Невалидный токен');
    }
    return payload._id;
  } catch (error) {
    throw new UnauthorizedError('Невалидный или просроченный токен');
  }
};

export const getAccessUserId = (req: Request): string => {
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || '');
  if (!match) throw new UnauthorizedError('Не передан access-токен');
  return verifyToken(match[1], accessSecret);
};

export const getRefreshToken = (req: Request): string => {
  const token = req.cookies?.refreshToken;
  if (typeof token !== 'string' || !token) {
    throw new UnauthorizedError('Не передан refresh-токен');
  }
  return token;
};

export const getRefreshUserId = (token: string): string => verifyToken(token, refreshSecret);

export const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, cookieOptions);
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: cookieOptions.httpOnly,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
    path: cookieOptions.path,
  });
};
