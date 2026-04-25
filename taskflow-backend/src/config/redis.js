const Redis = require("ioredis");
const dotenv = require("dotenv");
dotenv.config();

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (e) => console.error("Redis error", e));

module.exports = redis;