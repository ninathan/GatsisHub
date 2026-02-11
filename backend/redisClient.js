import { createClient } from 'redis';

let redisClient = null;

// Initialize Redis client
const initRedis = async () => {
    if (redisClient) return redisClient;

    try {
        // Use environment variables for Redis connection
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        
        redisClient = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('❌ Redis: Max reconnection attempts reached');
                        return new Error('Max reconnection attempts reached');
                    }
                    return Math.min(retries * 100, 3000);
                }
            }
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            console.log('🔄 Redis: Connecting...');
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis: Connected and ready');
        });

        redisClient.on('reconnecting', () => {
            console.log('🔄 Redis: Reconnecting...');
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        console.error('❌ Failed to initialize Redis:', error);
        console.log('⚠️  Continuing without Redis caching');
        redisClient = null;
        return null;
    }
};

// Get Redis client
const getRedisClient = () => redisClient;

// Cache middleware
const cacheMiddleware = (keyPrefix, ttl = 300) => {
    return async (req, res, next) => {
        if (!redisClient) {
            return next();
        }

        try {
            const cacheKey = `${keyPrefix}:${req.params.userid || req.params.orderid || 'all'}${req.path}`;
            
            const cachedData = await redisClient.get(cacheKey);
            
            if (cachedData) {
                console.log(`✅ Cache HIT: ${cacheKey}`);
                return res.status(200).json(JSON.parse(cachedData));
            }

            console.log(`❌ Cache MISS: ${cacheKey}`);
            
            // Store original res.json
            const originalJson = res.json.bind(res);
            
            // Override res.json to cache the response
            res.json = (data) => {
                if (res.statusCode === 200) {
                    redisClient.setEx(cacheKey, ttl, JSON.stringify(data))
                        .catch(err => console.error('Redis cache set error:', err));
                }
                return originalJson(data);
            };
            
            next();
        } catch (error) {
            console.error('Redis middleware error:', error);
            next();
        }
    };
};

// Invalidate cache for specific patterns
const invalidateCache = async (pattern) => {
    if (!redisClient) return;

    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`🗑️  Invalidated ${keys.length} cache entries matching: ${pattern}`);
        }
    } catch (error) {
        console.error('Cache invalidation error:', error);
    }
};

// Clear all orders cache
const clearOrdersCache = async () => {
    await invalidateCache('orders:*');
};

// Clear cache for specific user
const clearUserOrdersCache = async (userid) => {
    await invalidateCache(`orders:${userid}*`);
};

// Clear cache for all orders (admin)
const clearAllOrdersCache = async () => {
    await invalidateCache('orders:all*');
};

export default {
    initRedis,
    getRedisClient,
    cacheMiddleware,
    clearOrdersCache,
    clearUserOrdersCache,
    clearAllOrdersCache,
    invalidateCache
};
