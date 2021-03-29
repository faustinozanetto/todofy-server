import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';

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
}
