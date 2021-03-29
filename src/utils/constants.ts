/**
 * Returns true if app is in production or false if in development.
 */
export const __prod__: boolean = process.env.NODE_ENV === 'production';

/**
 * Returns the port used on production
 */
export const __port__ = process.env.PORT || 4000;

/**
 * Return the cookie name used on express session.
 */
export const __cookie__: string = 'todofy-cookie';

/**
 * Return the origin uri.
 */
export const __origin__ = __prod__
  ? process.env.CORS_ORIGIN
  : 'http://localhost:3000';

export const __apiOrigin__ = __prod__
  ? 'https://todofy-backend.herokuapp.com'
  : 'http://localhost:4000';
/**
 * Returns the secret used for express session.
 */
export const __secret__ = __prod__ ? process.env.ACCESS_TOKEN_SECRET : 'secret';

/**
 * Returns the secret used for refresh session.
 */
export const __refreshSecret__ = __prod__
  ? process.env.REFRESH_TOKEN_SECRET
  : 'refresh_secret';

/**
 * Redis URI used for sessions
 */
export const __redis__ = __prod__ ? process.env.REDIS : '127.0.0.1:6379';

/**
 * Database URL used in production
 */
export const __dbUrl__ = process.env.DATABASE_URL;
