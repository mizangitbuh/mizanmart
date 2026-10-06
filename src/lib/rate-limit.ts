/**
 * Simple in-memory rate limiter
 * 
 * Production-এ এটা Redis-এ করা উচিত।
 * কিন্তু ছোট business-এর জন্য in-memory যথেষ্ট।
 * 
 * ব্যবহার:
 *   const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 })
 *   const result = limiter.check(ip)
 *   if (!result.allowed) return error
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimiterOptions {
  maxRequests: number
  windowMs: number
}

export function createRateLimiter({ maxRequests, windowMs }: RateLimiterOptions) {
  const store = new Map<string, RateLimitEntry>()

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, windowMs)

  return {
    check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
      const now = Date.now()
      const entry = store.get(identifier)

      if (!entry || entry.resetAt < now) {
        // New window
        const resetAt = now + windowMs
        store.set(identifier, { count: 1, resetAt })
        return { allowed: true, remaining: maxRequests - 1, resetAt }
      }

      if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt }
      }

      entry.count++
      return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
    },
  }
}

// ═══════════════════════════════════════════════
// Pre-configured limiters
// ═══════════════════════════════════════════════

// Checkout: max 10 orders per 5 minutes per IP
export const checkoutLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 5 * 60 * 1000,
})

// Admin: max 100 requests per minute (for bulk operations)
export const adminLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000,
})

// Search: max 60 requests per minute
export const searchLimiter = createRateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000,
})

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string {
  const headers = request.headers
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  )
}
