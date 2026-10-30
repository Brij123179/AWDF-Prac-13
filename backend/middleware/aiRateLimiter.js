/**
 * Supplementary Problem 2: Rate Limiter Middleware for AI Endpoints
 * Enforces a strict maximum of 1 AI request per 60 seconds per client/task
 * to prevent API quota exhaustion, excessive billable calls, and denial of service.
 */

const requestTimestamps = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds (1 minute)

export function aiRateLimiter(req, res, next) {
  // Key based on authenticated user ID, forwarded header, or client IP
  const clientIdentifier = req.user?.id ||
    req.headers?.['x-forwarded-for'] ||
    req.headers?.['x-real-ip'] ||
    '127.0.0.1';

  const now = Date.now();
  const lastRequestTime = requestTimestamps.get(clientIdentifier);

  if (lastRequestTime) {
    const elapsed = now - lastRequestTime;
    if (elapsed < RATE_LIMIT_WINDOW_MS) {
      const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - elapsed) / 1000);
      res.setHeader('Retry-After', waitSeconds);
      console.warn(`🛑 [RateLimiter] AI request throttled for client ${clientIdentifier}. Must wait ${waitSeconds}s.`);
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: `Rate limit reached: Maximum 1 AI request per minute. Please wait ${waitSeconds} seconds before trying again.`,
        retryAfterSeconds: waitSeconds,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Update timestamp and proceed
  requestTimestamps.set(clientIdentifier, now);

  // Periodic memory cleanup: prune entries older than 5 minutes
  if (requestTimestamps.size > 500) {
    for (const [key, timestamp] of requestTimestamps.entries()) {
      if (now - timestamp > 5 * 60 * 1000) {
        requestTimestamps.delete(key);
      }
    }
  }

  next();
}

/**
 * Reset rate limit cache (useful for automated testing)
 */
export function resetRateLimits() {
  requestTimestamps.clear();
}
