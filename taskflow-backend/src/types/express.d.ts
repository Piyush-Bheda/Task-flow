import type { AuthTokenPayload } from "./app.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};
