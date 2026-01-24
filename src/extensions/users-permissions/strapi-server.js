// src/extensions/users-permissions/strapi-server.js

module.exports = (plugin) => {
  // 1. 保存 Strapi 原始的控制器方法
  // 我们需要先保存下来，以便验证通过后调用它们
  const originalForgotPassword = plugin.controllers.auth.forgotPassword;
  const originalCallback = plugin.controllers.auth.callback; // 这个对应登录接口 /api/auth/local

  /**
   * 辅助函数：验证 Cloudflare Turnstile Token
   * @param {string} token - 前端传来的 captchaToken
   * @returns {Promise<boolean>} - 验证成功返回 true，否则返回 false
   */
  const verifyTurnstile = async (token) => {
    // 如果没有 Token，直接视为失败
    if (!token) return false;

    try {
      const secretKey = process.env.TURNSTILE_SECRET_KEY;
      
      // 检查环境变量是否配置
      if (!secretKey) {
        console.error('错误: 未配置 TURNSTILE_SECRET_KEY 环境变量');
        return false;
      }

      const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      
      // Cloudflare 要求使用 form-data 格式提交
      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', token);

      const response = await fetch(verifyUrl, {
        method: 'POST',
        body: formData,
      });

      const outcome = await response.json();
      
      // outcome.success 为 true 表示验证通过
      if (!outcome.success) {
        // console.warn('Turnstile验证失败:', outcome['error-codes']); // 调试用
        return false;
      }

      return true;
    } catch (err) {
      console.error('Turnstile连接错误:', err);
      // 如果连接 Cloudflare 失败，为了安全起见，通常返回 false (Fail Closed)
      return false;
    }
  };

  /**
   * 2. 重写 Forgot Password 控制器
   * 拦截 POST /api/auth/forgot-password
   */
  plugin.controllers.auth.forgotPassword = async (ctx) => {
    const { captchaToken } = ctx.request.body;

    // 执行验证
    const isHuman = await verifyTurnstile(captchaToken);

    if (!isHuman) {
      return ctx.badRequest('人机验证失败，请刷新页面重试');
    }

    // 验证通过，执行原始逻辑（发送邮件）
    return originalForgotPassword(ctx);
  };

  /**
   * 3. 重写 Callback 控制器 (用于处理登录)
   * 拦截 POST /api/auth/local
   */
  plugin.controllers.auth.callback = async (ctx) => {
    const provider = ctx.params.provider || 'local';

    // 只有当使用 'local' (账号密码登录) 时才强制验证验证码
    // 如果你集成了 Google/GitHub 等第三方登录，通常不需要在此处验证
    if (provider === 'local') {
      const { captchaToken } = ctx.request.body;

      // 执行验证
      const isHuman = await verifyTurnstile(captchaToken);

      if (!isHuman) {
        return ctx.badRequest('人机验证失败或已过期，请刷新页面重试');
      }
    }

    // 验证通过，执行原始逻辑（发放 JWT Token）
    return originalCallback(ctx);
  };

  return plugin;
};