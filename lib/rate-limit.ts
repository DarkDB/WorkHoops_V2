// Simple in-memory rate limiter for development
interface RateLimitEntry {
  timestamp: number
  count: number
}

const rateLimitStore = new Map<string, RateLimitEntry[]>()

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
  const now = Date.now()
  const windowStart = now - window
  
  // Get or create entries for this identifier
  let entries = rateLimitStore.get(identifier) || []
  
  // Remove expired entries
  entries = entries.filter(entry => entry.timestamp > windowStart)
  
  // Count current requests
  const currentCount = entries.length
  
  if (currentCount >= limit) {
    // Find the oldest entry to calculate reset time
    const oldestEntry = entries[0]
    const resetTime = oldestEntry 
      ? new Date(oldestEntry.timestamp + window)
      : new Date(now + window)
    
    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetTime,
    }
  }
  
  // Add current request
  entries.push({ timestamp: now, count: 1 })
  rateLimitStore.set(identifier, entries)
  
  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - (currentCount + 1)),
    reset: new Date(now + window),
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