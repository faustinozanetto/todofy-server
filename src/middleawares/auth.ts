import * as jwt from 'jsonwebtoken';
import { TodofyContext } from 'types';
import { MiddlewareFn } from 'type-graphql';

import { __secret__ } from '../utils/constants';

export const isAuth: MiddlewareFn<TodofyContext> = ({ context }, next) => {
  const authorization = <string>context.req.headers['authorization'];
  if (!authorization) {
    //context.res.sendStatus(401);
    throw new Error('You must be logged in to access this page!');
  }
  try {
    const token = authorization.split(' ')[1];
    const payload = jwt.verify(token, __secret__!);
    context.payload = payload as any;
  } catch (err) {
    throw new Error('You must be logged in to access this page!');
  }

  return next();
};
