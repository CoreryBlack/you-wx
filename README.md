# 大牛加油站 - 微信小程序 (you-wx)

本仓库为 `you-wx`，基于 `uni-app` + `Vue3` 的微信小程序与 H5 前端，以及一个示例后端服务（位于 `server/`）。

## 项目说明
- 技术栈：`uni-app`、`Vue 3`、`Pinia`。
- 目标平台：微信小程序（`mp-weixin`）、H5（浏览器）。

## 快速开始

先决条件：
- Node.js >= 18

安装依赖：

```bash
npm install
```

本地开发：

- H5（浏览器）: `npm run dev:h5`  
- 微信小程序：`npm run dev:mp-weixin`  （需安装并配置 `uni-app` 工具链）

构建：

- H5 构建: `npm run build:h5`  
- 微信小程序构建: `npm run build:mp-weixin`

清理构建缓存：

`npm run clean`

代码检查：

`npm run lint` 或 `npm run lint:fix`

## 后端（示例）
后端示例位于 `server/`，提供微信登录（jscode2session + JWT）等接口：

启动后端：

```bash
cd server
npm install
npm start
```

默认后端入口：`server/index.js`，脚本名为 `start`。

## 项目结构（概要）
- `src/` - 前端源码（`pages`、`components`、`api`、`store` 等）
- `pages/` - 小程序原生页面（保留）
- `server/` - 示例后端
- `sdk/` - 第三方或本地 SDK（如 `luch-request`）
- `uni_modules/` - 组件库（`uview-next`）

更多详细开发说明请参阅 `docs/DEVELOPMENT.md`。

## 开发规范
- 使用 ESLint 检查代码风格（见 `package.json` 中的 `lint` 脚本）
- 组件与页面使用 `src/pages` / `src/components` 目录结构
- 状态管理使用 `pinia`（位于 `src/store`）

## 贡献
欢迎提交 issue 与 PR。请在 PR 中包含变更说明与必要的复现步骤。

---

**配置**

- **目的**：仓库不应包含真实的密钥或私密配置。请使用仓库中的示例模板生成本地私有配置，并确保这些文件被 `.gitignore` 忽略。

- **已添加示例文件（请复制并填写真实值）**：
	- `server/.env.example` -> 复制为 `server/.env`，并填入 `WECHAT_APPID`、`WECHAT_SECRET`、`JWT_SECRET` 等真实值。
	- `src/manifest.example.json` -> 复制为 `src/manifest.json`（小程序打包时使用），并填入 `mp-weixin.appid`。
	- `project.config.example.json` -> 复制为 `project.config.json`（仅在使用 HBuilderX/微信开发者工具时需要），并填入 `appid`。



更多文档和接口说明见 `docs/` 目录。
