const redis = require("../config/redis");

exports.getCache = async (key) => {
  const v = await redis.get(key);
  return v ? JSON.parse(v) : null;
};

exports.setCache = async (key, value, ttlSec = 90) => {
  await redis.set(key, JSON.stringify(value), "EX", ttlSec);
};

exports.delCache = async (key) => {
  await redis.del(key);
};