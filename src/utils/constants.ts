/**
 * Returns true if app is in production or false if in development.
 */
export const __prod__: boolean = process.env.NODE_ENV === 'production';

/**
 * Returns the port used on production
 */
export const __port__ = parseInt(process.env.PORT) || 4000;

/**
 * Return the cookie name used on express session.
 */
export const __cookie__ = 'todofy-cookie';

/**
 * Return the origin uri.
 */
export const __origin__ = __prod__
  ? process.env.CORS_ORIGIN
  : 'http://localhost:3000';

/**
 * Returns the secret used for express session.
 */
export const __secret__ = __prod__
  ? process.env.SESSION_SECRET
  : 'Lu4g0zTbPakiHx1RIAKx';
