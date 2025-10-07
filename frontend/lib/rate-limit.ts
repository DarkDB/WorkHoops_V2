import { Redis } from 'redis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
}

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60 * 1000 // 1 minute in milliseconds
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`
  const now = Date.now()
  const windowStart = now - window

  try {
    // Remove expired entries
    await redis.zremrangebyscore(key, '-inf', windowStart)
    
    // Count current requests in window
    const current = await redis.zcard(key)
    
    if (current >= limit) {
      // Get the oldest entry to calculate reset time
      const oldest = await redis.zrange(key, 0, 0, { withScores: true })
      const resetTime = oldest.length > 0 
        ? new Date((oldest[0].score as number) + window)
        : new Date(now + window)

      return {
        success: false,
        limit,
        remaining: 0,
        reset: resetTime,
      }
    }

    // Add current request
    await redis.zadd(key, { score: now, value: `${now}-${Math.random()}` })
    
    // Set expiration on key
    await redis.expire(key, Math.ceil(window / 1000))

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - (current + 1)),
      reset: new Date(now + window),
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // If Redis fails, allow the request but log the error
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: new Date(now + window),
    }
  }
}

export async function rateLimitByIP(
  ip: string,
  limit: number = 10,
  window: number = 60 * 1000
): Promise<RateLimitResult> {
  return rateLimit(`ip:${ip}`, limit, window)
}

export async function rateLimitByUser(
  userId: string,
  limit: number = 10,
  window: number = 60 * 1000
): Promise<RateLimitResult> {
  return rateLimit(`user:${userId}`, limit, window)
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.getTime().toString(),
  }
}