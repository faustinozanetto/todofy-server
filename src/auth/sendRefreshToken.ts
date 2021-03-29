import { Response } from 'express';
import { __apiOrigin__, __prod__ } from '../utils/constants';

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie('qid', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    //maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/refresh_token',
  });
};
