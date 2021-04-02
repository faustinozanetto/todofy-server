import { sign } from 'jsonwebtoken'

import { User } from '../entities'
import { __refreshSecret__, __secret__ } from '../utils/constants'

/**
 *
 * @param user param used to retrieve the id.
 * @returns the access token.
 */
export const createAccessToken = (user: User) => {
  return sign({ userId: user.id }, __secret__!, {
    expiresIn: '15m',
  });
};

/**
 *
 * @param user param used to retrieve the id.
 * @returns the refresh access token.
 */
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
