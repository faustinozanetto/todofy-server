import { Response } from 'express'

import { __apiOrigin__, __prod__ } from '../utils/constants'

/**
 * 
 * @param res response param used to send the cookie.
 * @param token string param containing the user access token.
 */
export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie('qid', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/refresh_token',
  });
};
