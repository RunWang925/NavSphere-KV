# NavSphere-KV 部署说明

本项目在 NavSphere 基础上把数据存储改为 **Cloudflare KV**、登录改为 **密码登录**、图片存储改为 **KV（默认）/ R2（可选）**。
改导航数据不再触发重新部署，后台只需密码即可进入。**完全无 GitHub 依赖，fork 即用。**
界面与后台逻辑与原项目一致。

---

## 一、本地开发

```bash
cd NavSphere-KV
pnpm install        # 或 npm install
cp .env.example .env
# 编辑 .env，填入 ADMIN_PASSWORD 和 SESSION_SECRET（随机长字符串）
pnpm dev            # http://localhost:3000
```

本地开发时 KV 不可用，数据会自动回退到 `navsphere/content/navigation.json`（只读，保存不持久化）。
登录密码取 `.env` 里的 `ADMIN_PASSWORD`，未设置则默认 `admin`。

---

## 二、部署到 Cloudflare Pages（免费，无需服务器）

### 1. Fork 仓库
把 `NavSphere-KV` 推到你自己的 GitHub 仓库。

### 2. 创建 KV 命名空间
Cloudflare Dashboard → Workers & Pages → KV → 创建命名空间，名字随意（例如 `NAVSphere_DB`）。

### 3. 创建 Pages 应用
Workers & Pages → 创建应用程序 → Pages → 连接到 Git → 选你的仓库。

### 4. 构建配置
| 项 | 值 |
|---|---|
| 框架预设 | None |
| 构建命令 | `npx @cloudflare/next-on-pages@1` |
| 输出目录 | `.vercel/output/static` |

### 5. 环境变量
Settings → Environment variables → 添加：
- `SESSION_SECRET` = 随机长字符串（至少 32 位，可用 `openssl rand -base64 32` 生成）
- `ADMIN_PASSWORD` = 后台登录密码（**可选**，不设默认 `admin`，登录后可在后台修改）

### 6. 绑定 KV（必需）
Settings → Functions → KV namespace bindings → 添加：
- 变量名：`NAV_KV`
- KV 命名空间：选第 2 步创建的

### 7. 绑定 R2（可选，图片多时推荐）
Settings → Functions → R2 bucket bindings → 添加：
- 变量名：`R2_BUCKET`
- R2 存储桶：选一个已创建的 R2 桶（没有就先在 R2 页面创建一个）

> **不绑 R2 也完全能用**——图片会存进 KV（单值上限 25MB，图标绰绰有余）。
> 很多人无法开通 R2（需绑信用卡），不绑完全没问题。
> 绑了 R2 后图片自动走 R2（单对象上限 5TB，免费 10GB/月，更适合大量图片）。

### 8. 部署
回到 Deployments → 点 "Create new deployment" / "重新部署"。

首次部署后，前台会自动用仓库里的 `navigation.json` 初始化 KV（无需手动操作）。

---

## 三、存储架构

| 数据类型 | 存储位置 | 说明 |
|---|---|---|
| 导航数据（分类、网站条目） | KV `navigation` | 所有文字数据，实时生效 |
| 站点设置（标题、描述等） | KV `site` | |
| 资源元数据（图片列表索引） | KV `resource` | 只存索引，不存图片本体 |
| 图片二进制（手动上传/抓取的图标） | **R2（配了优先）** 或 **KV** | 每张图独立 key，通过 `/api/asset/{key}` 访问 |
| 图标 URL（网站自带 favicon） | 不存储 | 直接用外部 URL，零开销 |

> **大部分图标是外部 URL**（网站自己的 favicon），不占任何存储。
> 只有手动上传或抓取后需要本地存的图标才进 KV/R2。

**KV vs R2 对比**：

| | KV | R2 |
|---|---|---|
| 适合 | 文字数据（频繁读） | 图片文件（大对象） |
| 单值上限 | 25MB | 5TB |
| 免费额度 | 10万读/天 | 10GB存储/月 |
| 开通条件 | 无需信用卡 | 需绑信用卡 |
| 本项目用途 | 必需（存所有文字数据） | 可选（仅存图片二进制） |

**日常推荐**：只绑 KV 够用。大量图片建议用自己图床（URL 方式零存储），R2 适合没图床但要传很多图片的人。

---

## 四、和原项目的区别

| 项 | 原项目（项目1） | 本项目 |
|---|---|---|
| 数据存储 | GitHub 仓库文件 | Cloudflare KV |
| 图片存储 | GitHub 仓库 `public/assets/` | KV（默认）或 R2（可选） |
| 登录 | GitHub OAuth | 密码 |
| 改数据是否重新部署 | 是 | **否** |
| fork 后能否直接部署 | 否（需配 GitHub OAuth + 仓库权限） | **是（只需绑 KV，密码默认 admin）** |
| 需要的环境变量 | GITHUB_CLIENT_ID/SECRET/OWNER/REPO/BRANCH | ADMIN_PASSWORD / SESSION_SECRET |
| 需要的绑定 | 无 | KV (NAV_KV) + R2 (R2_BUCKET，可选) |

---

## 五、数据备份

KV 不带版本历史。如需备份，可在后台"数据管理"页面用"下载到本地"导出 JSON。