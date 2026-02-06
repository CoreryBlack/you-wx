const express = require('express');
const router = express.Router();

/**
 * GET /api/qr/get_dynamic_token
 * 简单模拟新版二维码获取接口，返回一个临时动态 token
 * 返回格式：{ code: 0, message: 'success', data: { token: 'xxx', expires_in: 300 } }
 */
router.get('/get_dynamic_token', (req, res) => {
  // 这里可以根据实际需要校验用户、cardId、权限等
  const token = (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).toUpperCase();
  const expiresIn = 300; // 有效期，单位秒

  res.json({
    code: 0,
    message: 'success',
    data: {
      token,
      expires_in: expiresIn
    }
  });
});

module.exports = router;
