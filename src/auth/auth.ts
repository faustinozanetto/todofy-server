import { User } from '../entities';
import { sign } from 'jsonwebtoken';
import { __refreshSecret__, __secret__ } from '../utils/constants';

export const createAccessToken = (user: User) => {
  return sign({ userId: user.id }, __secret__!, {
    expiresIn: '15m',
  });
};

export const createRefreshToken = (user: User) => {
  return sign(
    {
      userId: user.id,
      tokenVersion: user.tokenVersion,
    },
    __refreshSecret__!,
    {
      expiresIn: '7d',
    }
  );
};
