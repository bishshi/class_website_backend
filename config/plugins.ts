module.exports = {
  // 1. Redis 插件配置 (来自第一段代码)
  redis: {
    config: {
      settings: {
        debug: false,
        enableRedlock: true,
      },
      connections: {
        default: {
          connection: {
            host: '127.0.0.1',
            port: 6379,
            db: 0,
          },
          settings: {
            debug: false,
          },
        },
      },
    },
  },

  // 2. Rest Cache 插件配置 (来自第二段代码)
  "rest-cache": {
    config: {
      provider: {
        name: "redis",
        options: {
          // 这里引用上面 redis 配置中定义的 "default" 连接
          connection: "default",
          // 缓存时间 (毫秒)，这里是 1 小时
          ttl: 3600 * 1000, 
        },
      },
      strategy: {
        // 如果你的 Redis 没有设置 keyPrefix，可以将下面这行注释掉或删除
        // keysPrefix: "<redis_keyPrefix>", 
        
        // 要缓存的内容类型列表
        contentTypes: [
          "api::articles.articles",
          "api::students.students",
          "api::teachers.teachers",
          "api::slides.slides",
          "api::notices.notices",
          "api::timers.timers",
        ],
      },
    },
  },
};