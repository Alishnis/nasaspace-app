const redis = require('redis');

class CacheService {
  constructor() {
    this.redisClient = null;
    this.memoryCache = new Map();
    this.isRedisConnected = false;
    this.initRedis();
  }

  async initRedis() {
    try {
      this.redisClient = redis.createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              console.log('Redis unavailable, using in-memory cache');
              return false;
            }
            return Math.min(retries * 100, 1000);
          }
        }
      });

      this.redisClient.on('error', (err) => {
        if (this.isRedisConnected) {
          console.log('Redis Client Error:', err.message);
        }
        this.isRedisConnected = false;
      });

      this.redisClient.on('connect', () => {
        console.log('Connected to Redis');
        this.isRedisConnected = true;
      });

      await this.redisClient.connect();
    } catch (error) {
      console.log('Redis connection failed, using in-memory cache');
      this.isRedisConnected = false;
    }
  }

  async get(key) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        const value = await this.redisClient.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        return this.memoryCache.get(key) || null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return this.memoryCache.get(key) || null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.setEx(key, ttl, JSON.stringify(value));
      } else {
        this.memoryCache.set(key, value);
        // Set TTL for memory cache
        const timer = setTimeout(() => {
          this.memoryCache.delete(key);
        }, ttl * 1000);
        // Don't keep the process alive just for cache expiry
        timer.unref();
      }
    } catch (error) {
      console.error('Cache set error:', error);
      this.memoryCache.set(key, value);
    }
  }

  async del(key) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
      this.memoryCache.delete(key);
    }
  }

  async flush() {
    try {
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.flushAll();
      } else {
        this.memoryCache.clear();
      }
    } catch (error) {
      console.error('Cache flush error:', error);
      this.memoryCache.clear();
    }
  }
}

module.exports = new CacheService();
