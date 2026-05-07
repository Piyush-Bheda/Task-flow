import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : new Redis();

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (error: Error) => console.error("Redis error", error));

export default redis;
