/** Dev: Angular → Nest (OpenAI calls only from server). */
module.exports = {
  '/api': {
    target: 'http://localhost:3333',
    secure: false,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
  },
};
