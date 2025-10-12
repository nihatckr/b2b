export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "testing";
      PORT?: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      APP_SECRET: string;
      AUTH_TOKEN: string;
    }
  }
}
