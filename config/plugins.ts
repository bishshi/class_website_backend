export default () => ({});
module.exports = ({ env }) => ({
  // ... 其他插件
  
  'rest-cache': {
    config: {
      provider: {
        name: 'redis',
        options: {
          max: 32767,
          connection: {
            connection: {
              host: env('REDIS_HOST', '127.0.0.1'),
              port: env.int('REDIS_PORT', 6379),
              db: env.int('REDIS_DB', 0),
              password: env('REDIS_PASSWORD'),
            },
          },
        },
      },
      strategy: {
        // 开启调试 Header，方便你在浏览器 Network 面板看到 X-Cache-Hit
        enableXCacheHeaders: true,
        contentTypes: [
          // 这里添加你想缓存的 Collection Type
          // 格式：'api::api-name.content-type-name'
          'api::article.article', 
          'api::category.category',
        ],
      },
    },
  },
});