/**
 * Simple in-memory rate limiter (per Google account email).
 * Limits each user to MAX_REQUESTS tailoring jobs per WINDOW_MS.
 *
 * NOTE: This works well on a single server. On Vercel (serverless),
 * each function instance has its own memory — for stricter enforcement,
 * swap the Map with an Upstash Redis KV store.
 */

const MAX_REQUESTS = 5;          // max tailoring jobs per user
const WINDOW_MS = 60 * 60 * 1000; // per hour (3,600,000 ms)

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const requestMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
} {
  const now = Date.now();
  const entry = requestMap.get(userId);

  // First request or window has expired — reset
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    requestMap.set(userId, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetInMs: WINDOW_MS };
  }

  // Within window — increment count
  if (entry.count < MAX_REQUESTS) {
    entry.count++;
    return {
      allowed: true,
      remaining: MAX_REQUESTS - entry.count,
      resetInMs: WINDOW_MS - (now - entry.windowStart),
    };
  }

  // Limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetInMs: WINDOW_MS - (now - entry.windowStart),
  };
}
