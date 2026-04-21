# my-site

基于 Astro + Netlify 的个人站点，包含博客、作品集、友链页面，并集成了一个由 Claude 驱动的 AI 聊天助手（站长的"数字分身"）。

## 技术栈

- [Astro 6](https://astro.build/) — SSR 模式（`output: 'server'`）
- [@astrojs/netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/) — Netlify 适配器
- [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) — MDX 内容渲染
- [Anthropic Claude API](https://docs.claude.com/) — `claude-haiku-4-5` 流式对话

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env`：

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

> `.env` 已被 `.gitignore` 排除，不会进入版本库。

### 3. 启动开发服务器

```bash
npm run dev
```

默认地址：http://localhost:4321

> **如果本机设置了 HTTP 代理**（例如 `http_proxy=http://127.0.0.1:7897`），需要把 localhost 加入 `no_proxy`，否则访问 `localhost:4321` 会被代理拦截返回 502：
>
> ```bash
> export no_proxy="localhost,127.0.0.1,::1"
> export NO_PROXY="localhost,127.0.0.1,::1"
> ```
>
> 建议写入 `~/.zshrc` 永久生效。

### 4. 本地构建预览

```bash
npm run build
npm run preview
```

## Netlify 部署

### 1. 推送到 Git 仓库

将本仓库推送到 GitHub / GitLab / Bitbucket。

### 2. 在 Netlify 导入

- New site → Import an existing project → 选择仓库
- 构建配置已由根目录 `netlify.toml` 提供（无需手动填写）：
  - Build command: `npm run build`
  - Publish directory: `dist`
- Astro 适配器会自动把 SSR API 路由（如 `/api/chat`）部署为 Netlify Functions

### 3. 设置环境变量

在 Netlify 控制台 → **Site settings → Environment variables** 添加：

| Key | Value |
|---|---|
| `ANTHROPIC_API_KEY` | 你的 Anthropic API Key |

保存后触发一次重新部署即可生效。

## 目录结构

```
my-site/
├── astro.config.mjs       # Astro 配置（SSR + Netlify adapter + MDX）
├── netlify.toml           # Netlify 构建配置
├── package.json
├── tsconfig.json
├── public/                # 静态资源（直接拷贝到根路径）
└── src/
    ├── components/        # 复用组件
    │   ├── NavBar.astro
    │   ├── BlogCard.astro
    │   ├── WorkCard.astro
    │   └── ChatWidget.astro   # AI 聊天浮窗（前端流式 SSE）
    ├── content/           # 内容集合（Markdown / MDX）
    │   ├── blog/
    │   └── works/
    ├── layouts/           # 页面布局
    ├── pages/             # 路由
    │   ├── index.astro
    │   ├── links.astro
    │   ├── works.astro
    │   ├── blog/
    │   │   ├── index.astro
    │   │   └── [slug].astro
    │   └── api/
    │       └── chat.ts    # SSR API：转发到 Anthropic Messages 流式接口
    └── styles/            # 全局样式
```

## 脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建到 `dist/` |
| `npm run preview` | 本地预览构建产物 |
