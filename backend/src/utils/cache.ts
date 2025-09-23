interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class SimpleCache<T> {
  private cache = new Map<string, CacheItem<T>>()

  set(key: string, data: T, ttlMs: number = 300000): void { // 5 min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

export const userCache = new SimpleCache()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, item] of userCache['cache'].entries()) {
    if (now - item.timestamp > item.ttl) {
      userCache.delete(key)
    }
  }
}, 300000)