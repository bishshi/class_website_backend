// src/middlewares/turnstile.ts

export default (config, { strapi }) => {
  return async (ctx, next) => {
    // 1. 筛选：只拦截登录和忘记密码的 POST 请求
    if (
      (ctx.path === '/api/auth/forgot-password' || ctx.path === '/api/auth/local') &&
      ctx.method === 'POST'
    ) {
      console.log('🛡️ [Turnstile中间件] 拦截到请求:', ctx.path);

      // 2. 获取 Token
      // 注意：必须确保此时 body 已被解析（在 config/middlewares.ts 中要放在 strapi::body 之后）
      const { captchaToken } = ctx.request.body || {};

      if (!captchaToken) {
        return ctx.badRequest('请完成人机验证 (Token缺失)');
      }

      // 3. 验证 Token
      try {
        const secretKey = process.env.TURNSTILE_SECRET_KEY;
        if (!secretKey) {
          console.error('❌ 未配置 TURNSTILE_SECRET_KEY');
          return ctx.badRequest('服务器配置错误');
        }

        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', captchaToken);

        const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const response = await fetch(verifyUrl, { method: 'POST', body: formData });
        const outcome = await response.json() as any;

        if (!outcome.success) {
          console.warn('❌ [Turnstile中间件] 验证失败');
          return ctx.badRequest('人机验证失败，请刷新页面重试');
        }
        
        console.log('✅ [Turnstile中间件] 验证成功');

      } catch (err) {
        console.error('Turnstile API Error:', err);
        return ctx.badRequest('验证服务不可用');
      }

      // 4. 🔥 关键步骤：验证通过后，彻底删除 captchaToken
      // 这样后续的 Strapi 验证器就看不到这个多余字段了，也就不会报错了
      delete ctx.request.body.captchaToken;
    }

    // 放行，进入后续流程
    await next();
  };
};