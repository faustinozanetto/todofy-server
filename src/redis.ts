import Redis from 'ioredis';

export const redis =
  process.env.NODE_ENV === 'production'
    ? new Redis({
        host: process.env.REDIS_URL,
        password: 'BBloOdjrh6XzAW9gSo9TAZGXmti6X2sL',
      })
    : new Redis({
        host: process.env.REDIS_URL,
        password: 'BBloOdjrh6XzAW9gSo9TAZGXmti6X2sL',
      });
