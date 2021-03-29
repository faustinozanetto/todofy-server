import { Response } from 'express';
import { __prod__ } from '../utils/constants';

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie('jid', token, {
    httpOnly: true,
    path: '/refresh_token',
    secure: __prod__ ? true : false,
  });
};
