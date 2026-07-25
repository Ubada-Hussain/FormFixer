/**
 * Lightweight in-memory rate limiter for Next.js API Routes.
 * Note: If deployed on Vercel Serverless, this cache resets when the function cold-starts.
 * For true distributed rate limiting across many instances, Upstash Redis (@upstash/ratelimit) is recommended.
 */

type CacheEntry = {
  count: number;
  resetTime: number;
};

const rateLimitCache = new Map<string, CacheEntry>();

export function rateLimit(identifier: string, limit: number, windowMs: number): { success: boolean } {
  const now = Date.now();
  const entry = rateLimitCache.get(identifier);

  // Clean up expired entries occasionally to prevent memory leaks (1% chance on each run)
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitCache.entries()) {
      if (now > value.resetTime) {
        rateLimitCache.delete(key);
      }
    }
  }

  if (!entry || now > entry.resetTime) {
    rateLimitCache.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false };
  }

  entry.count += 1;
  return { success: true };
}
