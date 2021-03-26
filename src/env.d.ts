declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT: string;
    REDIS_URL: string;
    SESSION_TOKEN: string;
    REFRESH_TOKEN_SECRET: string;
    CORS_ORIGIN: string;
  }
}