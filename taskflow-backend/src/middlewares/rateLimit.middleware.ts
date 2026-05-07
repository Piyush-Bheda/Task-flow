import type { NextFunction, Request, Response } from "express";
import redis from "../config/redis.js";
import type { TypedRequestHandler } from "../types/app.js";

/**
 * `x-forwarded-for` may be set by a proxy and can contain a comma-separated
 * chain. The original code treated it as an opaque string, so we intentionally
 * keep that behavior instead of attempting to normalize the first hop.
 */
function getRequestIdentifier(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  return req.ip ?? (typeof forwardedFor === "string" ? forwardedFor : "unknown");
}

export function rateLimit(
  keyPrefix: string,
  limit = 5,
  windowSec = 60,
): TypedRequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = getRequestIdentifier(req);
      const key = `${keyPrefix}:${ip}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSec);
      }

      if (current > limit) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Try again later.",
        });
      }

      next();
    } catch {
      next();
    }
  };
}
