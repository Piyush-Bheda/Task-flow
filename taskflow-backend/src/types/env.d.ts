declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    NODE_ENV?: string;
    JWT_SECRET?: string;
    SENTRY_DSN?: string;
    DB_USER?: string;
    DB_HOST?: string;
    DB_NAME?: string;
    DB_PASSWORD?: string;
    DB_PORT?: string;
    REDIS_URL?: string;
  }
}
