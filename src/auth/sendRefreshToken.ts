import { Response } from 'express';
import { __origin__, __prod__ } from '../utils/constants';

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie('jid', token, {
    httpOnly: true,
    path: '/refresh_token',
    signed: false,
  });
};
