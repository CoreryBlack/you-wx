require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const transactionsRouter = require('./routes/transactions');
const qrRouter = require('./routes/qr');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// 挂载路由 - 基于 docs/API_REFERENCE.md 的接口设计
app.use('/api/auth', authRouter);   // 员工登录等认证接口
app.use('/api/users', usersRouter); // 小程序用户相关接口
app.use('/api/cards', cardsRouter); // 油卡接口
app.use('/api/transactions', transactionsRouter); // 交易记录接口
app.use('/api/qr', qrRouter); // 二维码相关接口（新版动态 token）

app.get('/', (req, res) => res.send('Oil Station Management System API Server'));

app.listen(port, () => {
  console.log(`API Server running on port ${port}`);
  console.log(`Access: http://localhost:${port}`);
});
