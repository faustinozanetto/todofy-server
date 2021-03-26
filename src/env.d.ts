declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT: string;
    SESSION_TOKEN: string;
    REFRESH_TOKEN_SECRET: string;
    CORS_ORIGIN: string;
  }
}
