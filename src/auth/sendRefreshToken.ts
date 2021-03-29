import { Response } from 'express';
import { __prod__ } from '../utils/constants';

export const sendRefreshToken = async (res: Response, token: string) => {
  res.cookie('jid', token, {
    httpOnly: true,
    path: '/refresh_token',
    // Forces to use https in production
    secure: __prod__ ? true : false,
  });
};
