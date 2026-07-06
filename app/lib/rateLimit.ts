import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// One limiter instance per "policy" — reuse across routes that need the same limits.
// Each gets its own Redis key prefix so they don't collide.

export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 attempts per minute per identifier
  prefix: "ratelimit:login",
  analytics: true, // free dashboard in Upstash console showing block rates
});

export const contactFormRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"), // more lenient — legit users rarely submit 3x in 10 min
  prefix: "ratelimit:contact",
  analytics: true,
});

// Generic factory for any future route — pass your own limits per use case.
export function createRateLimiter(prefix: string, requests: number, window: `${number} ${"s" | "m" | "h"}`) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:${prefix}`,
    analytics: true,
  });
}