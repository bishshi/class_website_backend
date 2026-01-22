// config/plugins.ts
export default ({ env }) => ({
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
        enableXCacheHeaders: true,
        contentTypes: [
          'api::articles.articles',
          'api::students.students',
          'api::teachers.teachers',
          'api::slides.slides',
          'api::notices.notices',
          'api::timers.timers',
        ],
      },
    },
  },
});