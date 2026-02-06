# 开发文档

此文档记录 `you-wx` 项目的开发流程、约定与常见操作，面向新加入的开发者和需要进行本地调试/构建的同学。

## 环境准备

- Node.js >= 18
- 推荐使用 npm（或 pnpm/yarn 按团队约定）
- 需要安装 `uni-app` 的开发工具（例如 HBuilderX 或者使用 `vite` + `uni` 命令行）

## 依赖安装

```bash
npm install
```

如果第一次使用 `server`，请进入后端目录安装依赖：

```bash
cd server
npm install
```

## 本地调试

- 启动前端 H5（浏览器调试）：

```bash
npm run dev:h5
```

- 启动微信小程序预览（需要微信小程序开发者工具配合）：

```bash
npm run dev:mp-weixin
```

- 启动示例后端：

```bash
cd server
npm start
```

后端默认脚本为 `start`（参见 `server/package.json`）。

## 目录与代码组织

- `src/`：前端源码主目录
  - `src/pages/`：页面组件
  - `src/components/`：可复用 UI 组件
  - `src/api/`：接口封装模块，按功能分 `modules/` 子目录
  - `src/store/`：Pinia 状态管理
  - `src/utils/`：工具方法（如 `http.js`、路由封装等）
- `sdk/`：本地第三方库（如 `luch-request`）
- `server/`：示例后端（Express）
- `uni_modules/`：`uview-next` 等第三方组件库

## 开发约定

- 代码风格：使用 eslint（`npm run lint`）进行检查
- 样式：尽量使用 `src/styles/variables.scss` 中的变量，避免重复样式
- 组件命名：以大驼峰命名组件目录与文件，如 `BalanceCard/BalanceCard.vue`
- 状态管理：尽量将业务逻辑放在 `store` 或 `api` 层，组件只负责展示

## 接口与网络请求

- 项目中使用 `src/api/index.js` 作为统一出口，具体接口按 `src/api/modules/*.js` 组织。
- HTTP 封装位于 `src/utils/http.js`，如需替换或修改请求策略，请在此处统一改动。

## 调试与日志

- 前端：H5 模式下浏览器 Console；小程序模式请使用微信开发者工具的 Console 与 Network。
- 后端：示例后端使用 `console` 打印日志，生产请接入日志系统或监控。

## 构建与发布

- H5 构建：`npm run build:h5`，产物位于 `dist`（由 `uni` 工具链管理）。
- 小程序构建：`npm run build:mp-weixin`，将生成小程序对应的目录输出，使用微信开发者工具上传发布。

## 常见问题

- 无法启动 `uni` 命令：请确认已全局安装或使用推荐的 `uni` 运行方式，或用 HBuilderX。
- 后端接口异常：检查 `server/.env`（如有）或确保 `server` 已启动并且跨域配置正确（`cors`）。

## 贡献与提交规范

- 请在 PR 描述中写清变更点和复现步骤。
- 简单变更可直接提交到 `develop` 分支，重大变更请先开 issue 讨论（按团队协定）。

---

有其它需要补充的文档（如详细 API、部署说明、测试用例等），我可以继续为你生成并加入 `docs/` 目录。 
