import { TodofyContext } from 'types';
import { MiddlewareFn } from 'type-graphql';
import * as jwt from 'jsonwebtoken';
import { __secret__ } from '../utils/constants';

export const isAuth: MiddlewareFn<TodofyContext> = ({ context }, next) => {
  const authorization = <string>context.req.headers.authorization;
  if (!authorization) {
    context.res.sendStatus(401);
    throw new Error('Invalid authorization');
  }
  try {
    const token = authorization.split(' ')[1];
    const payload = jwt.verify(token, __secret__!);
    context.payload = payload as any;
  } catch (err) {
    console.log(err);
    throw new Error('not authenticated');
  }

  return next();
};
