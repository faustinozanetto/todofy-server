import { NextFunction, Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { User } from './entities';

export interface RequestCustom extends Request {
  username?: string;
  password?: string;
}

/**
 * Todofy Context containing some type declarations for cleaner code such as Request and Session.
 */
export interface TodofyContext {
  req: Request & {
    session: Session & Partial<SessionData> & { userId: number };
  };
  res: Response;
  payload?: { userId: string };
  next: NextFunction;
  authenticate: (
    type: string,
    credentials: any
  ) => Promise<{
    user: User;
    info: string;
  }>;
}
