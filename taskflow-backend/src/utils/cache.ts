import redis from "../config/redis.js";

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  return value ? (JSON.parse(value) as T) : null;
}

export async function setCache<T>(key: string, value: T, ttlSec = 90): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttlSec);
}

export async function delCache(key: string): Promise<void> {
  await redis.del(key);
}
