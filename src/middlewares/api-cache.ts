// src/middlewares/api-cache.ts
import redis from '../utils/redis'; // 引入刚才创建的连接

export default (config, { strapi }) => {
  return async (ctx, next) => {
    // 1. 只缓存 GET 请求，且只缓存 /api/ 开头的
    if (ctx.method !== 'GET' || !ctx.url.startsWith('/api/')) {
      await next();
      return;
    }

    // 2. 生成缓存 Key (直接用 URL)
    const cacheKey = `strapi_cache:${ctx.url}`;

    try {
      // 3. 尝试从 Redis 取数据
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        // ✅ 命中缓存！直接返回，不查数据库
        ctx.body = JSON.parse(cachedData);
        ctx.set('X-Cache', 'HIT'); // 标记一下方便调试
        return;
      }
    } catch (err) {
      console.error('Redis read error:', err);
    }

    // 4. 没命中，继续执行 Strapi 原本的逻辑（查数据库）
    await next();

    // 5. 拿到结果后，如果是 200 OK，就存入 Redis
    if (ctx.status === 200 && ctx.body) {
      // 设置过期时间 60 秒 (EX 60)
      redis.set(cacheKey, JSON.stringify(ctx.body), 'EX', 60).catch(err => {
        console.error('Redis write error:', err);
      });
      ctx.set('X-Cache', 'MISS');
    }
  };
};