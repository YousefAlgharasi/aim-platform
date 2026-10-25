// CRA dev-server proxy: forwards same-origin /api/* to the backend with the
// prefix stripped, matching the production nginx config. Override the target
// with AIM_API_PROXY_TARGET (e.g. http://localhost:3000).
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.AIM_API_PROXY_TARGET || 'https://api.13-63-152-107.sslip.io',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    }),
  );
};
