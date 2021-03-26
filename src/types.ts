import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';

/**
 * Todofy Context containing some type declarations for cleaner code such as Request and Session.
 */
export type TodofyContext = {
  req: Request & {
    session: Session & Partial<SessionData> & { userId: number };
  };
  res: Response;
  payload?: { userId: string };
};
