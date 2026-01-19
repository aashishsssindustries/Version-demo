import Redis from 'ioredis';
import config from './env';
import logger from './logger';

/**
 * Redis client wrapper with graceful fallback to in-memory cache.
 * If Redis is unavailable, operations fall back to a Map-based cache.
 */
class RedisCache {
    private client: Redis | null = null;
    private memoryCache: Map<string, { value: string; expiry: number }> = new Map();
    private isConnected = false;

    constructor() {
        this.initializeRedis();
    }

    private initializeRedis(): void {
        const redisUrl = config.get('REDIS_URL');

        if (!redisUrl) {
            logger.info('Redis URL not configured, using in-memory cache fallback');
            return;
        }

        try {
            this.client = new Redis(redisUrl, {
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => Math.min(times * 100, 3000),
                lazyConnect: true,
                connectTimeout: 5000,
            });

            this.client.on('connect', () => {
                this.isConnected = true;
                logger.info('Redis connected successfully');
            });

            this.client.on('error', (err) => {
                logger.warn('Redis connection error, falling back to memory cache', { error: err.message });
                this.isConnected = false;
            });

            this.client.on('close', () => {
                this.isConnected = false;
                logger.info('Redis connection closed');
            });

            // Attempt connection
            this.client.connect().catch((err) => {
                logger.warn('Failed to connect to Redis, using memory cache', { error: err.message });
            });
        } catch (error) {
            logger.warn('Redis initialization failed, using memory cache fallback');
        }
    }

    /**
     * Get a value from cache
     */
    async get(key: string): Promise<string | null> {
        // Try Redis first
        if (this.isConnected && this.client) {
            try {
                return await this.client.get(key);
            } catch (error) {
                logger.warn('Redis get failed, checking memory cache', { key });
            }
        }

        // Fallback to memory cache
        const cached = this.memoryCache.get(key);
        if (cached) {
            if (Date.now() < cached.expiry) {
                return cached.value;
            }
            this.memoryCache.delete(key);
        }
        return null;
    }

    /**
     * Set a value in cache with TTL (seconds)
     */
    async set(key: string, value: string, ttlSeconds: number): Promise<void> {
        // Try Redis first
        if (this.isConnected && this.client) {
            try {
                await this.client.setex(key, ttlSeconds, value);
                return;
            } catch (error) {
                logger.warn('Redis set failed, using memory cache', { key });
            }
        }

        // Fallback to memory cache
        this.memoryCache.set(key, {
            value,
            expiry: Date.now() + (ttlSeconds * 1000),
        });
    }

    /**
     * Delete a key from cache
     */
    async del(key: string): Promise<void> {
        if (this.isConnected && this.client) {
            try {
                await this.client.del(key);
            } catch (error) {
                logger.warn('Redis del failed', { key });
            }
        }
        this.memoryCache.delete(key);
    }

    /**
     * Check if using Redis or memory fallback
     */
    isUsingRedis(): boolean {
        return this.isConnected;
    }

    /**
     * Cleanup memory cache (remove expired entries)
     */
    cleanupMemoryCache(): void {
        const now = Date.now();
        for (const [key, value] of this.memoryCache.entries()) {
            if (now >= value.expiry) {
                this.memoryCache.delete(key);
            }
        }
    }
}

// Singleton instance
const redisCache = new RedisCache();

// Periodic cleanup of memory cache (every 5 minutes)
setInterval(() => {
    redisCache.cleanupMemoryCache();
}, 5 * 60 * 1000);

export default redisCache;
