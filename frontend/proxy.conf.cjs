const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

/** Dev-only: forwards /openai → api.openai.com with Bearer from OPENAI_API_KEY (browser cannot call OpenAI directly due to CORS). */
module.exports = {
  '/openai': {
    target: 'https://api.openai.com',
    secure: true,
    changeOrigin: true,
    pathRewrite: { '^/openai': '' },
    onProxyReq: (proxyReq) => {
      const key = process.env.OPENAI_API_KEY;
      if (key) {
        proxyReq.setHeader('Authorization', `Bearer ${key}`);
      }
    },
  },
};
