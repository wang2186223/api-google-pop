# ADX Google 跳转网站

这是一个简单的网站，用于将访问 `adx-google.com` 或 `www.adx-google.com` 的用户自动跳转到 Google Ad Manager (`https://admanager.google.com`)。

## 功能特性

- **自动跳转**: 使用多种方式确保可靠的跳转
  - HTML meta refresh
  - JavaScript window.location
  - Vercel 301 重定向
- **双重保障**: 支持 www 和非 www 域名
- **用户友好**: 显示加载动画和备用链接
- **SEO 优化**: 使用 301 永久重定向

## 技术实现

### 跳转方式

1. **Vercel 重定向** (主要方式)
   - 使用 `vercel.json` 配置 301 永久重定向
   - 在服务器级别处理，速度最快

2. **HTML Meta Refresh** (备用方式)
   - 在 HTML head 中设置 meta refresh
   - 兼容性最好

3. **JavaScript 跳转** (备用方式)
   - 立即执行和延迟执行双重保障
   - 处理特殊情况

### 文件结构

```
├── index.html      # 主页面文件
├── vercel.json     # Vercel 配置文件
└── README.md       # 项目说明文档
```

## 部署步骤

### 1. GitHub 设置

1. 确保代码已推送到 GitHub 仓库: `https://github.com/wang2186223/api-google-pop.git`

### 2. Vercel 部署

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 GitHub 仓库 `api-google-pop`
5. 保持默认设置，点击 "Deploy"

### 3. 域名配置

#### 在 Vercel 中添加自定义域名:

1. 进入项目设置 → Domains
2. 添加域名:
   - `adx-google.com`
   - `www.adx-google.com`

#### 在域名注册商处配置 DNS:

**对于根域名 (adx-google.com):**
```
类型: A
名称: @
值: 76.76.19.19
```

**对于 www 子域名:**
```
类型: CNAME
名称: www
值: cname.vercel-dns.com
```

### 4. SSL 证书

Vercel 会自动为你的域名配置 SSL 证书，通常在几分钟内完成。

## 验证

部署完成后，可以通过以下方式验证:

1. 访问 `http://adx-google.com` - 应该跳转到 Google Ad Manager
2. 访问 `http://www.adx-google.com` - 应该跳转到 Google Ad Manager
3. 访问 `https://adx-google.com` - 应该跳转到 Google Ad Manager
4. 访问 `https://www.adx-google.com` - 应该跳转到 Google Ad Manager

## 注意事项

- DNS 生效可能需要 24-48 小时
- 确保在域名注册商处正确配置了 DNS 记录
- 如果遇到问题，检查 Vercel 项目的 Functions 和 Deployments 日志

## 技术支持

如果遇到任何问题，可以:

1. 检查 Vercel 部署日志
2. 验证 DNS 配置是否正确
3. 确认域名已添加到 Vercel 项目中

---

**项目创建时间**: 2025年10月14日  
**GitHub 仓库**: https://github.com/wang2186223/api-google-pop.git