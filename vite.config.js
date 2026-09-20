import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  if (isDev) {
    const env = loadEnv(mode, process.cwd(), '');
    Object.assign(process.env, env);
  }

  const plugins = [];
  if (isDev) {
    plugins.push({
      name: 'api-serverless-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url ? req.url.split('?')[0] : '';
          if (url === '/api/ai-concierge' || url === '/api/leads' || url === '/api/contact' || url === '/api/send-measurements') {
            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', async () => {
              try {
                req.body = bodyStr ? JSON.parse(bodyStr) : {};
              } catch {
                req.body = {};
              }

              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };

              try {
                if (url === '/api/ai-concierge') {
                  const moduleUrl = new URL(`./api/ai-concierge.js?t=${Date.now()}`, import.meta.url).href;
                  const { default: handler } = await import(moduleUrl);
                  return handler(req, res);
                }
                if (url === '/api/leads') {
                  const moduleUrl = new URL(`./api/leads.js?t=${Date.now()}`, import.meta.url).href;
                  const { default: handler } = await import(moduleUrl);
                  return handler(req, res);
                }
                if (url === '/api/contact') {
                  const moduleUrl = new URL(`./api/contact.js?t=${Date.now()}`, import.meta.url).href;
                  const { default: handler } = await import(moduleUrl);
                  return handler(req, res);
                }
                if (url === '/api/send-measurements') {
                  const moduleUrl = new URL(`./api/send-measurements.js?t=${Date.now()}`, import.meta.url).href;
                  const { default: handler } = await import(moduleUrl);
                  return handler(req, res);
                }
              } catch (err) {
                console.error('API middleware error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
          next();
        });
      }
    });
  }

  return {
    plugins,
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          about: resolve(__dirname, 'about.html'),
          collections: resolve(__dirname, 'collections.html'),
          measurements: resolve(__dirname, 'measurements.html'),
          gallery: resolve(__dirname, 'gallery.html'),
          contact: resolve(__dirname, 'contact.html'),
          privacy: resolve(__dirname, 'privacy-policy.html'),
          terms: resolve(__dirname, 'terms.html'),
          measurementPolicy: resolve(__dirname, 'measurement-policy.html'),
          refundCancellation: resolve(__dirname, 'refund-cancellation.html'),
          shipping: resolve(__dirname, 'shipping.html'),
        },
      },
    },
  };
});
