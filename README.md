# NavSphere-KV

一个自托管导航站，数据存在 Cloudflare KV，改数据不用重新部署，fork 即用。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-username/NavSphere-KV)

> 点击按钮一键部署到 Cloudflare（需先 fork 本仓库到你自己的 GitHub，并把上面链接里的 `your-username` 换成你的 GitHub 用户名）。

---

## 原理说明

### 数据存储：为什么改数据不用重新部署？

传统做法是把导航数据写成 JSON 文件放进项目里，每次改数据都要重新构建部署。

本项目的做法：导航数据存在 **Cloudflare KV**（一个云端键值数据库）里。前台每次打开页面时，直接从 KV 实时读取数据。你在后台改了数据 → 写进 KV → 前台刷新就能看到，**全程不用重新部署**。

### 图片存储：KV 够用，R2 更好

- **大部分图标**：直接用网站自带的 favicon URL，不占任何存储。
- **手动上传的图片**：默认存 KV（单张上限 25MB，图标绰绰有余）。
- **配了 R2**（可选）：图片自动走 R2 对象存储（免费 10GB/月，更适合大量图片）。

不配 R2 也完全能用，fork 即可部署。

### 登录：密码，不需要 GitHub 账号

后台用密码登录，不依赖 GitHub OAuth。
- **不设任何变量**：默认密码 `admin`，fork 即用
- **设了 `ADMIN_PASSWORD`**：用你设的密码
- **后台可改密码**：登录后右上角菜单 → 修改密码，存进 KV 永久生效

### 为什么 fork 即用？

本项目**完全不依赖 GitHub 仓库做存储**——数据在 KV、图片在 KV/R2、登录用密码。fork 仓库后只需要：
1. 绑一个 KV（必需）
2. 设一个密码（必需）
3. 绑一个 R2（可选）

就能跑起来，不需要任何 GitHub Token 或仓库权限。

> **不设密码也能用**——默认密码 `admin`，登录后可在后台修改。
> **不绑 R2 也完全能用**——很多人无法开通 R2（需绑信用卡），图片走 KV 完全够用。

---

## 快速开始

### 本地开发

```bash
pnpm install
cp .env.example .env
# 编辑 .env 设置 ADMIN_PASSWORD 和 SESSION_SECRET
pnpm dev
```

打开 http://localhost:3000 ，后台在 http://localhost:3000/admin

### 部署到 Cloudflare

详细步骤见 [DEPLOY.md](./DEPLOY.md)，简单说就是：

1. Fork 仓库到你的 GitHub
2. 在 Cloudflare Pages 连接这个仓库
3. 绑定 KV（变量名 `NAV_KV`）
4. 设置环境变量 `SESSION_SECRET`（`ADMIN_PASSWORD` 可选，不设默认 `admin`）
5. 部署

构建命令：`npx @cloudflare/next-on-pages@1`
输出目录：`.vercel/output/static`

---

## 和原项目 (NavSphere) 的区别

| | 原项目 | 本项目 |
|---|---|---|
| 数据存储 | GitHub 仓库文件 | Cloudflare KV |
| 图片存储 | GitHub 仓库 | KV / R2 |
| 登录 | GitHub OAuth | 密码 |
| 改数据要重新部署？ | 要 | **不要** |
| fork 能直接部署？ | 不能 | **能** |
