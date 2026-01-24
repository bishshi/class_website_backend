// src/extensions/users-permissions/strapi-server.js

module.exports = (plugin) => {
  const originalForgotPassword = plugin.controllers.auth.forgotPassword;
  const originalCallback = plugin.controllers.auth.callback;

  const verifyTurnstile = async (token) => {
    if (!token) return false;
    try {
      const secretKey = process.env.TURNSTILE_SECRET_KEY;
      if (!secretKey) {
        console.error('错误: 未配置 TURNSTILE_SECRET_KEY');
        return false;
      }
      const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', token);

      const response = await fetch(verifyUrl, { method: 'POST', body: formData });
      const outcome = await response.json();
      return outcome.success;
    } catch (err) {
      console.error('Turnstile连接错误:', err);
      return false;
    }
  };

  // --- 重写 Forgot Password ---
  plugin.controllers.auth.forgotPassword = async (ctx) => {
    const { captchaToken } = ctx.request.body;

    const isHuman = await verifyTurnstile(captchaToken);
    if (!isHuman) {
      return ctx.badRequest('人机验证失败，请刷新页面重试');
    }

    delete ctx.request.body.captchaToken;

    return originalForgotPassword(ctx);
  };

  // --- 重写 Login (Callback) ---
  plugin.controllers.auth.callback = async (ctx) => {
    const provider = ctx.params.provider || 'local';

    if (provider === 'local') {
      const { captchaToken } = ctx.request.body;

      const isHuman = await verifyTurnstile(captchaToken);
      if (!isHuman) {
        return ctx.badRequest('人机验证失败或已过期，请刷新页面重试');
      }

      delete ctx.request.body.captchaToken;
    }

    return originalCallback(ctx);
  };

  return plugin;
};