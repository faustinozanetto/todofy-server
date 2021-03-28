import { TodofyContext } from 'types';
import { MiddlewareFn } from 'type-graphql';
import { Secret, verify } from 'jsonwebtoken';

export const isAuth: MiddlewareFn<TodofyContext> = ({ context }, next) => {
  const authorization = <string>context.req.headers['authorization'];
  if (!authorization) {
    throw new Error('Invalid authorization');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET as Secret);
    context.payload = payload as any;
  } catch (err) {
    context.res.status(401).send();
    console.log(err);
    throw new Error('not authenticated');
  }

  return next();
};
