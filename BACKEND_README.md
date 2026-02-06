# 后端示例 - 微信一键登录接口（示例）

此示例演示如何实现一个简单的后端 `/auth/wx-login` 接口，用于接收小程序 `code` 与用户信息，调用微信 `jscode2session` 接口换取 `openid`，然后查找或创建用户并返回 JWT token。

> 说明：该示例为演示用途，使用内存存储用户数据。生产环境请接入数据库（MySQL/Postgres/MongoDB 等），并对 JWT 密钥、错误处理、安全性做更严格处理。

## 文件说明

- `server/index.js` - Express 服务入口
- `server/routes/auth.js` - 实现 `/auth/wx-login` 路由
- `server/.env.example` - 环境变量示例
- `server/package.json` - 依赖及启动脚本

## 环境变量

复制 `.env.example` 为 `.env`，并设置：

```
WECHAT_APPID=你的微信小程序 AppID
WECHAT_SECRET=你的微信小程序 AppSecret
JWT_SECRET=生成一个足够随机的字符串
PORT=8080
```

## 启动服务

1. 进入 `server` 目录：

```bash
cd server
npm install
npm start
```

2. 服务启动后，默认监听 `http://localhost:8080`。

## 接入前端（你当前项目）

前端已经存在 `POST /users/wx-login` 的调用（见 `api/auth.js` 中的 `wxLogin` 方法）。确保：

- `config/http.js` 中的 `baseURL` 指向你的后端地址（例如 `http://localhost:8080`）
- 若前端使用了代理或环境变量，请在 `.env` 或构建配置中设置 `VITE_APP_BASE_API` 对应后端地址（不要忘记包含 `/api` 路径规则，如果适用）

示例调用参数：

```json
{
  "code": "wxCodeFromClient",
  "nickName": "用户昵称",
  "avatarUrl": "头像URL",
  "gender": 1,
  "country": "中国",
  "province": "广东",
  "city": "深圳"
}
```

成功响应示例：

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "JWT_TOKEN_HERE",
    "userInfo": {
      "id": 1,
      "nickName": "昵称",
      "avatarUrl": "...",
      "gender": 1
    }
  }
}
```

## 注意事项

- `jscode2session` 是微信小程序使用的接口，适用于小程序场景。如果你需要做公众号/网站的微信登录流程，请使用对应的 OAuth2 流程。
- 生产环境请使用 HTTPS、保存 JWT 黑名单、刷新令牌策略，并将用户信息存入持久化存储。
- 若需要将 `session_key` 用于数据解密（如解密手机号），请保存 `session_key` 并对解密操作进行服务端实现。

---

如需我把这个后端示例部署到某个云服务或容器（例如 Dockerfile、PM2 配置），我也可以继续帮你生成。