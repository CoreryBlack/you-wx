# 油站管理系统 API 开发文档

本文档基于 `docs/script.sql` 数据库设计，定义了后端 API 接口规范。

## 1. 通用说明

- **基础 URL**: `/api`
- **请求格式**: `application/json`
- **响应格式**: `application/json`
- **成功响应**: `{ "code": 0, "data": { ... }, "msg": "success" }`
- **错误响应**: `{ "code": 1xxx, "msg": "错误描述" }`
- **认证**: 大多数 API 现在要求在请求头中携带 `Authorization: Bearer <token>`（除 `/api/staff/login` 和 `/api/staff/register` 之外）。登录后后端会在响应中返回 token，登出接口会撤销服务器端 token。

## 2. 接口定义

### 2.1 认证 (Auth)

*   **登录**
    *   `POST /auth/login`
    *   参数: `{ "username": "...", "password": "..." }`
    *   返回: `{ "token": "...", "staff": { ... } }`（token 应在后续请求中放到 Authorization 头）

### 2.2 员工管理 (Staff)
对应表: `staff`

*   **获取员工列表**
    *   `GET /staff`
    *   查询参数: `page`, `pageSize`, `station_id` (可选)
*   **获取员工详情**
    *   `GET /staff/:id`
*   **创建员工**
    *   `POST /staff`
    *   参数: `{ "username", "password", "name", "role", "station_id" }`
*   **更新员工**
    *   `PUT /staff/:id`
"""
# 油站管理系统 — API 参考（自动同步自 server/routes）

本文档由代码中的路由文件聚合而成，列出了当前后端暴露的主要接口、参数与示例。基础前缀在开发环境通常为 `/api`（根据 server/index.js 的挂载而定）。

## 通用说明

- 基础 URL: `/api`
- 请求格式: `application/json`
- 响应格式: `application/json`
- 成功响应格式示例:

```json
{ "code": 0, "data": { /* ... */ }, "msg": "success" }
```

- 常见错误响应示例:

```json
{ "code": 400, "msg": "Bad Request" }
```

- 认证: 多数需要 `Authorization: Bearer <token>`（除登录/注册类接口）。token 生成与撤销在 `server/lib/token.js` 中实现。

---

## 接口清单（按路由文件）

**Auth / 认证**

- POST /auth/login
    - 描述: 登录（支持使用 username、phone 或 staff_id 作为标识符）
    - 请求体:

```json
{ "username": "alice", "password": "pwd123", "identifier": "alice|138...|S001" }
```
    - 返回:

```json
{ "code":0, "data": { "token":"<jwt>", "staff": { "staff_id":"s123", "username":"alice", "name":"Alice" } }, "msg":"success" }
```

- POST /auth/logout
    - 描述: 注销（会撤销 token）
    - 支持从 `Authorization` 头或 body.token 中读取要撤销的 token
    - 返回: `{ code:0, msg:'success' }`

- POST /auth/register
    - 描述: 注册一个新的前端用户（示例实现，主要用于演示/测试）
    - 请求体: `{ phone, username, name, password }`
    - 返回: `{ code:0, data:{ user: { user_id, phone, nickname, ... } }, msg:'registered' }`

**Staff / 员工**

- GET /staff
    - 描述: 列表，返回 `data.total` 与 `data.list`

- POST /staff
    - 描述: 创建员工
    - 可接收: `{ username, phone, name, role, station_id, password|passwordHash }`（若传明文 password 会在后端哈希）

- PUT /staff/:id
    - 描述: 更新员工（支持传 password / passwordHash，后端会做哈希兼容）

- DELETE /staff/:id
    - 描述: 删除/停用员工

**Users / 会员**

- GET /users
    - 查询参数: `phone`, `page`, `size`
    - 返回: `{ code:0, data:{ total, list }, msg:'success' }`

- GET /users/:id
    - 描述: 获取会员详情

- POST /users
    - 描述: 注册/创建会员
    - 请求体: `{ phone, nickname }`

- PUT /users/:id
    - 描述: 更新会员（允许更新 phone, nickname, status）

- DELETE /users/:id
    - 描述: 删除会员

- POST /users/:id/adjust-points
    - 描述: 调整指定用户积分（示例兼容实现）
    - 请求体: `{ delta }`（整数，可为负）
    - 返回: `{ code:0, data:{ user_id, points }, msg:'success' }`

**Transactions / 交易记录**

- GET /transactions
    - 查询参数: `userId`, `cardId`, `type`
    - 返回: `{ code:0, data:{ list, total }, msg:'success' }`（结果按时间倒序）

- POST /transactions
    - 描述: 创建一条交易记录（通常由后端内部逻辑创建，但对外也有接口以便手动录入）
    - 请求体: 任意交易字段，返回创建对象

**Stations / 油站**

- GET /stations
    - 返回油站列表

- POST /stations
    - 创建油站，请求体: `{ name, address }`

- GET /stations/:id/terminals
    - 返回模拟的终端列表（示例数据）

**Cards / 燃油卡**

- GET /cards
    - 查询参数: `card_no`, `user_id`
    - 返回匹配卡的列表

- POST /cards
    - 创建卡: `{ user_id, initial_balance }`，返回卡信息

- GET /cards/:card_no/transactions
    - 返回该卡的交易记录

- POST /cards/adjust-balance
    - 描述: 调整卡余额（用于充值/扣款）
    - 请求体: `{ card_no, amount_cents, note }`
    - 返回: `{ code:0, data:{ card_no, balance_cents }, msg:'success' }`

- PUT /cards/:card_no
    - 描述: 更新卡信息（如解绑 user_id、修改 status）

**Orders / 订单**

- GET /orders
    - 返回订单列表

- POST /orders
    - 创建订单（POS 上报）
    - 请求体示例: `{ client_tx_id, amount_cents, station_id }`

**Products / 商品**

- GET /products
    - 返回商品列表

- POST /products
    - 创建或修改商品：如果传入 `id` 则尝试更新，否则创建新商品
    - 请求体: `{ id?, name, points, stock, description }`

- DELETE /products/:id
    - 删除商品

**Points / 积分（独立路由 points.js）**

- POST /points/adjust-points
    - 描述: 为用户加/减积分，兼容多种字段名（userId/user_id 等）以及 points/delta/points_delta
    - 请求体示例: `{ userId: 'u123', points: 100, note?: '手动调整' }`

- GET /points/adjust-points/:userId
    - 返回 PointsAccount 风格的数据：`{ userId, points, updateTime }`

- GET /points
    - 不带 query 则返回所有用户积分列表，支持 `?userId=xxx` 查询单个用户

---

## 常见响应字段说明

- `code`: 0 表示成功；非 0 为错误或异常，局部接口会返回 400/404 等 HTTP 状态码并附带 `code` 与 `msg`。
- `data`: 成功时的主要返回体；结构依接口而异。

## 示例：使用 curl 登录并查询用户列表

```bash
curl -X POST https://your-host/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"username":"admin","password":"pwd"}'

# 返回后拿到 token：
curl -H "Authorization: Bearer <token>" https://your-host/api/users
```

---

如果需要，我可以：
- 生成一个 OpenAPI / Swagger 描述文件（基于以上信息），
- 或者为每个端点补充更详尽的请求/响应示例与错误码表。

"""
