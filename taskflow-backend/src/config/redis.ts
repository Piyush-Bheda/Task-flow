 import { Redis } from "ioredis";
  import dotenv from "dotenv";

  dotenv.config();

  const redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          // Stop retrying after 10 attempts to prevent infinite log spam
          return times > 10 ? null : delay;
        },
      })
    : new Redis();

  redis.on("connect", () => console.log("Redis connected"));
  redis.on("error", (error: Error) => {
    // Log a cleaner message
    console.error(`Redis Connection Error: ${error.message}`);
  });

  export default redis;