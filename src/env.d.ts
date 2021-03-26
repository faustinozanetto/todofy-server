declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT: number;
    SESSION_SECRET: string;
    CORS_ORIGIN: string;
  }
}
