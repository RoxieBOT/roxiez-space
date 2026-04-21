---
title: "我做了个个人站点"
description: "记录一下用 Astro + Netlify 搭这个站点的过程，以及踩到的坑。"
pubDate: 2026-04-21
---

## 缘起

一直想有一个完全属于自己的数字空间。最近终于动手了。

名字叫 **Roxie's Space**，主色是橙色 + 米白 + 棕色，想做出"既活泼又沉稳"的感觉。

## 技术栈

- **Astro 6 (SSR)** — 路由、内容集合、Markdown 渲染
- **Netlify** — 部署 + Functions 跑 AI 聊天接口
- **Claude API** — 驱动右下角那个 AI 分身

整套下来，从零到线上，大约花了一个周末。

## 站点里有什么

- 首页 —— 自我介绍和 CTA
- 作品集 —— 我做过 / 在做 / 想做的事
- 博客 —— 就是你现在看的这里
- 社交链接 —— Gmail / GitHub / WeChat / AIRoxie
- 右下角浮窗 —— 我的 AI 分身，基于 Claude Haiku 4.5，人格由 `IDENTITY.md` + `SOUL.md` 外置定义

## 踩过的几个坑

### 1. 本地代理让 localhost 访问变 502

`http_proxy=http://127.0.0.1:7897` 让浏览器访问 dev server 的请求全被代理拦了。
解法：把 `localhost, 127.0.0.1, ::1` 加进 `no_proxy`（shell）+ macOS 系统代理的例外列表（浏览器）。

### 2. 流式接口中途断

Claude 官方 `/v1/messages` 流有时候会被网络中间层掐断。
解法：服务端用 `TransformStream` 中转，断流时注入 `{type:"error"}` 事件；前端区分「已有部分输出」vs「完全没收到」两种情况分别处理。

### 3. 第三方 API 中转 vs 官方 Key

本地开发复用已有的 new-api 中转省钱，但生产部署最好直连官方。
解法：`chat.ts` 做了 provider 抽象，环境变量切换 `anthropic` / `openai` 两种协议，代码一份、跑两个地方。

## 下一步

- [ ] 加 RSS 订阅
- [ ] 评论系统（Giscus 还是自建待定）
- [ ] 博客标签和筛选
- [ ] 正式写点营销 / GEO 方向的干货内容

---

这个站点本身就是第一个"作品"。后面慢慢填。
