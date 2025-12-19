# ContentCreator 网站部署指南

本指南将详细介绍如何将 ContentCreator 项目部署到各种环境中。

## 目录

1. [环境准备](#环境准备)
2. [项目构建](#项目构建)
3. [部署选项](#部署选项)
   - [静态托管服务](#静态托管服务)
   - [VPS/云服务器](#vps云服务器)
   - [Docker 容器化部署](#docker-容器化部署)
4. [配置与优化](#配置与优化)
5. [常见问题与解决方案](#常见问题与解决方案)

## 环境准备

在部署之前，请确保您的环境满足以下要求：

1. **Node.js 环境**
   - 推荐版本: 18.x 或更高
   - 检查方式: `node -v`

2. **包管理器**
   - 本项目使用 pnpm: `npm install -g pnpm`
   - 检查方式: `pnpm -v`

3. **Git**
   - 用于克隆项目和管理代码
   - 检查方式: `git --version`

## 项目构建

1. **克隆项目代码**
   ```bash
   git clone <项目仓库地址>
   cd ContentCreator
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **构建生产版本**
   ```bash
   pnpm build
   ```
   
   构建完成后，项目会在 `dist` 目录下生成静态文件。

4. **验证构建结果**
   ```bash
   pnpm preview
   ```
   
   此命令将启动一个本地服务器，用于预览生产版本的网站。您可以通过 `http://localhost:4173` 访问。

## 部署选项

### 静态托管服务

ContentCreator 是一个纯静态网站，适合部署到各种静态托管服务上。以下是几个常用平台的部署步骤：

#### Vercel

Vercel 是一个现代化的静态网站部署平台，特别适合部署基于 React、Vue、Next.js 等框架的前端应用。以下是详细的部署步骤：

1. **准备工作**
   - 确保您的项目代码已推送到 GitHub、GitLab 或 Bitbucket 等代码托管平台
   - 确保您的项目可以正常构建：运行 `pnpm install` 和 `pnpm build` 命令验证

2. **访问 Vercel 平台**
   - 访问 [Vercel 官方网站](https://vercel.com/)
   - 点击右上角的 "Sign Up" 按钮注册账户，或使用 GitHub/GitLab/Bitbucket 账户直接登录

3. **导入项目**
   - 登录成功后，您会进入 Vercel 仪表盘
   - 点击 "New Project" 按钮
   - 选择您的代码托管平台（如 GitHub），并授权 Vercel 访问您的仓库
   - 在仓库列表中找到您的项目并点击 "Import" 按钮

4. **配置项目设置**
   - 在 "Configure Project" 页面中，保持默认的项目名称和仓库
   - 在 "Build & Development Settings" 部分，配置：
     - Framework Preset: `Vite` (Vercel 通常会自动检测)
     - Build Command: `pnpm build`
     - Output Directory: `dist`
     - Install Command: `pnpm install`
   
   - 在 "Environment Variables" 部分，可以根据需要添加环境变量（如 API 基础 URL 等）
     - 点击 "Add" 添加环境变量
     - 变量名: `VITE_API_BASE_URL`
     - 变量值: `https://api.cloud算力服务.com/v1` (或您的实际 API 地址)
     - 可以添加多个环境变量，如需要
   
   - 滚动到底部，点击 "Deploy" 按钮开始部署

5. **等待部署完成**
   - Vercel 会自动执行构建和部署流程
   - 部署过程中，您可以查看实时的构建日志
   - 部署完成后，页面会显示成功信息和访问 URL

6. **访问已部署的网站**
   - 部署成功后，您可以通过 Vercel 提供的 URL 访问您的网站（格式通常为 `https://<项目名称>-<用户名>.vercel.app`）
   - 点击 "Visit" 按钮直接跳转

7. **自定义域名设置 (可选)**
   - 如果您有自己的域名，可以点击项目设置中的 "Domains" 选项卡
   - 输入您的域名，点击 "Add" 按钮
   - 按照 Vercel 提供的 DNS 配置指南，在您的域名注册商处添加相应的 DNS 记录
   - 等待 DNS 记录生效后，您的网站就可以通过自定义域名访问了

8. **自动部署配置 (可选)**
   - Vercel 默认会为您的主分支设置自动部署，每当您向主分支推送代码时，Vercel 会自动重新构建和部署您的网站
   - 您可以在项目设置的 "Git" 选项卡中配置更多自动部署规则，如为特定分支设置部署

9. **分支预览 (可选)**
   - Vercel 支持分支预览功能，每当您创建新的分支并推送代码时，Vercel 会自动为该分支创建一个预览环境
   - 这对于开发和测试非常有用，您可以在合并代码前预览新功能

10. **集成 CI/CD 工作流 (可选)**
    - 如果您想进一步定制部署流程，可以创建一个 `.vercelignore` 文件来排除不需要部署的文件
    - 您还可以使用 Vercel CLI 在本地测试和部署项目
    - 安装 Vercel CLI: `npm i -g vercel`
    - 登录: `vercel login`
    - 部署: `vercel --prod`

#### Netlify

1. **访问 [Netlify](https://www.netlify.com/) 并登录**
2. **点击 "Add new site" -> "Import an existing project"**
3. **连接您的 Git 仓库**
4. **配置构建设置**
   - 构建命令: `pnpm build`
   - 发布目录: `dist`
5. **点击 "Deploy site"**
6. **部署完成后，您将获得一个随机生成的 URL，也可以配置自定义域名**

#### GitHub Pages

GitHub Pages 是一个免费的静态网站托管服务，非常适合部署 ContentCreator 这样的纯前端应用。以下是详细的部署步骤：

### 1. 准备工作

- 确保您的项目已推送到 GitHub 仓库
- 确保您的项目可以在本地成功构建：运行 `pnpm install` 和 `pnpm build` 验证
- 确保您对仓库有管理权限，能够设置 GitHub Pages

### 2. 配置 GitHub Actions 工作流

项目根目录已包含 `.github/workflows/deploy.yml` 文件，该文件包含了自动部署的配置。此配置会在每次推送到 `main` 分支时自动构建和部署项目。

核心配置说明：
- **触发条件**：推送代码到 `main` 分支或创建 PR
- **权限设置**：包含必要的写入权限
- **构建环境**：使用 Node.js 18 和 pnpm 进行构建
- **缓存策略**：缓存 pnpm 依赖以加速构建
- **构建验证**：检查构建输出是否存在
- **部署操作**：自动部署到 `gh-pages` 分支

### 3. 手动创建或验证工作流文件

如果需要手动创建或验证 `.github/workflows/deploy.yml` 文件，请确保文件内容如下：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]  # 或者您的主分支名称
  pull_request:
    branches: [ main ]  # 用于PR预览

# 允许从fork的仓库中运行此工作流，同时保留写访问权限
permissions:
  contents: write
  pages: write
  id-token: write

# 环境配置
environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      # 检出代码
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 获取完整的提交历史

      # 设置 Node.js 环境
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'  # 使用 Node.js 18
          cache: 'pnpm'       # 缓存 pnpm 依赖

      # 安装 pnpm
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: latest  # 使用最新版本的 pnpm

      # 安装依赖并构建项目
      - name: Install dependencies and build
        run: |
          pnpm install --frozen-lockfile  # 确保依赖版本一致
          pnpm build                      # 构建项目

      # 构建结果检查
      - name: Verify build output
        run: |
          if [ ! -d "dist" ]; then
            echo "构建失败：dist 目录不存在"
            exit 1
          fi
          echo "构建成功，dist 目录包含 $(ls -la dist | wc -l) 个文件"

      # 生成 .nojekyll 文件，防止 GitHub Pages 忽略下划线开头的文件
      - name: Create .nojekyll
        run: touch ./dist/.nojekyll

      # 部署到 GitHub Pages
      - name: Deploy to GitHub Pages
        id: deployment
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist            # 构建输出目录
          branch: gh-pages        # 部署到的分支
          commit-message: 'Deploying to GitHub Pages'  # 自定义提交消息
          clean: true             # 清理目标分支上的旧文件
          single-commit: true     # 只创建一个提交

      # 输出部署状态
      - name: Output deployment status
        if: success()
        run: echo "✅ 部署成功！访问地址: ${{ steps.deployment.outputs.page_url }}"
```

### 4. 提交更改并启用 GitHub Pages

1. **提交工作流文件**（如果您修改了它）
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "配置 GitHub Pages 自动部署"
   git push origin main
   ```

2. **启用 GitHub Pages**
   - 访问您的 GitHub 仓库页面
   - 点击顶部导航栏中的 "Settings"
   - 在左侧菜单中选择 "Pages"
   - 在 "Build and deployment" 部分，确保 "Source" 设置为 "Deploy from a branch"
   - 在 "Branch" 下拉菜单中，选择 `gh-pages` 分支和 `/ (root)` 目录
   - 点击 "Save" 按钮

### 5. 验证部署

1. **检查 GitHub Actions 运行状态**
   - 回到仓库主页，点击顶部导航栏中的 "Actions"
   - 查看 "Deploy to GitHub Pages" 工作流的运行状态
   - 如果运行成功，您会看到绿色的对勾图标

2. **访问已部署的网站**
   - 部署成功后，您可以在 GitHub Pages 设置页面看到网站的 URL
   - 格式通常为 `https://<用户名>.github.io/<仓库名>/`
   - 注意：首次部署可能需要几分钟时间才能生效

### 6. 自定义域名配置（可选）

如果您想使用自定义域名访问网站，可以按照以下步骤操作：

1. **在域名注册商处添加 DNS 记录**
   - 添加一条 CNAME 记录，指向 `<用户名>.github.io`

2. **在 GitHub 仓库中配置自定义域名**
   - 回到 GitHub Pages 设置页面
   - 在 "Custom domain" 输入框中输入您的域名
   - 点击 "Save" 按钮
   - 勾选 "Enforce HTTPS" 选项以启用 HTTPS

### 7. 部署排错指南

如果部署失败，可以尝试以下排查步骤：

1. **检查 GitHub Actions 日志**
   - 点击失败的工作流运行
   - 展开每个步骤查看详细日志
   - 特别关注标红的错误信息

2. **常见错误及解决方案**
   - **构建失败**：确保 `package.json` 中的构建脚本正确，且所有依赖都能正确安装
   - **权限错误**：检查工作流文件中的 `permissions` 配置是否正确
   - **部署分支不存在**：首次部署可能需要等待 `gh-pages` 分支自动创建
   - **静态资源加载失败**：确保 Vite 配置中的 `base` 路径设置正确，对于 GitHub Pages，通常使用默认设置（`'/'`）或仓库名作为路径前缀

### VPS/云服务器

如果您希望部署到自己的服务器，可以按照以下步骤操作：

1. **准备服务器环境**
   - 安装 Node.js 和 Nginx
   - 配置防火墙，允许 80 和 443 端口

2. **上传构建文件**
   ```bash
   # 使用 scp 命令上传文件
   scp -r dist/* user@your-server-ip:/var/www/contentcreator
   ```

3. **配置 Nginx**
   ```bash
   # 创建 Nginx 配置文件
   sudo nano /etc/nginx/sites-available/contentcreator
   ```
   
   添加以下内容：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # 替换为您的域名

       root /var/www/contentcreator;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **启用配置并重启 Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/contentcreator /etc/nginx/sites-enabled/
   sudo nginx -t  # 检查配置是否正确
   sudo systemctl restart nginx
   ```

5. **(可选) 配置 HTTPS**
   - 使用 Certbot 申请免费的 SSL 证书
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Docker 容器化部署

使用 Docker 可以简化部署过程并确保环境一致性：

1. **在项目根目录创建 `Dockerfile`**
   ```dockerfile
   # 使用 Node.js 官方镜像作为构建环境
   FROM node:18-alpine AS build

   # 设置工作目录
   WORKDIR /app

   # 复制 package.json 和 pnpm-lock.yaml
   COPY package.json pnpm-lock.yaml ./

   # 安装 pnpm
   RUN npm install -g pnpm

   # 安装依赖
   RUN pnpm install

   # 复制项目文件
   COPY . .

   # 构建项目
   RUN pnpm build

   # 使用 Nginx 作为生产服务器
   FROM nginx:alpine

   # 复制构建结果到 Nginx
   COPY --from=build /app/dist /usr/share/nginx/html

   # 复制自定义 Nginx 配置
   COPY nginx.conf /etc/nginx/conf.d/default.conf

   # 暴露 80 端口
   EXPOSE 80

   # 启动 Nginx
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **创建 `nginx.conf` 文件**
   ```nginx
   server {
       listen 80;
       server_name localhost;

       location / {
           root /usr/share/nginx/html;
           index index.html index.htm;
           try_files $uri $uri/ /index.html;
       }

       error_page 500 502 503 504 /50x.html;
       location = /50x.html {
           root /usr/share/nginx/html;
       }
   }
   ```

3. **构建和运行 Docker 容器**
   ```bash
   # 构建 Docker 镜像
   docker build -t contentcreator .

   # 运行 Docker 容器
   docker run -p 80:80 contentcreator
   ```

4. **(可选) 使用 Docker Compose**
   创建 `docker-compose.yml` 文件：
   ```yaml
   version: '3'
   services:
     contentcreator:
       build: .
       ports:
         - "80:80"
       restart: always
   ```
   
   然后运行：
   ```bash
   docker-compose up -d
   ```

## 配置与优化

### API 配置

要使用真实的AI功能，您需要配置API密钥：

 1. 在应用中点击"配置API"按钮
 2. 输入您的API密钥（如OpenAI、Anthropic或Google的API密钥）
 3. 选择您要使用的AI模型
 4. 保存配置
 
> **注意：** 配置完成后，系统会使用这些API密钥调用相应的云算力服务进行内容生成。确保您的API密钥有效且有足够的使用配额。

配置会保存在浏览器的本地存储中，下次打开应用时会自动加载。

### 环境变量

 本项目支持以下环境变量，您可以在构建时设置：

```bash
# AI 云算力服务基础 URL - 在 Vercel 上部署时，您可以在 Vercel 控制台中设置这些环境变量
VITE_API_BASE_URL=https://api.cloud算力服务.com/v1

# 调试模式
VITE_DEBUG=false
```

如果您需要连接自定义的AI云算力服务，可以通过设置`VITE_API_BASE_URL`环境变量来指定服务地址。

### 性能优化

1. **图片优化**
   - 使用适当尺寸的图片
   - 压缩图片以减小文件大小
   - 考虑使用 WebP 格式图片

2. **缓存策略**
   - 配置浏览器缓存
   - 利用 CDN 分发静态资源

3. **代码分割**
   - 虽然当前项目结构简单，但随着项目增长，可以考虑实现代码分割

## 常见问题与解决方案

### 路由问题

**问题**: 在使用客户端路由时，直接访问子路由会返回 404 错误。

**解决方案**: 确保服务器配置了回退路由，将所有请求指向 `index.html`。

### 静态资源加载失败

**问题**: 部署后，CSS、JS 等静态资源无法加载。

**解决方案**:
- 检查资源路径是否正确
- 确保构建时设置了正确的 `base` 路径
- 检查服务器权限设置
- 在 Vercel 上：确保您的 `vite.config.ts` 中的 `base` 设置正确，对于 Vercel 部署，通常使用默认设置（`'/'`）即可

### 构建失败

**问题**: 在 CI/CD 环境中构建失败。

**解决方案**:
- 确保 CI 环境安装了 pnpm
- 检查 Node.js 版本是否兼容（项目推荐 Node.js 18）
- 清理缓存后重新构建
- 检查 `vite.config.ts` 中的 `outDir` 配置是否与部署配置匹配
- 尝试删除 `node_modules` 和 `pnpm-lock.yaml` 后重新安装依赖
- 在 Vercel 上：检查构建日志中的错误信息，确保环境变量设置正确，特别是 API 相关的环境变量
- 在 GitHub Pages 上：确保 `.github/workflows/deploy.yml` 文件中的配置正确，特别是 `node-version`、`cache` 和 `folder` 字段
- 检查是否有语法错误或类型错误：运行 `npx tsc --noEmit` 检查 TypeScript 错误


### GitHub Pages 特定问题

**问题**: GitHub Pages 部署后，某些路由无法访问（404 错误）。

**解决方案**:
- 确保您的应用使用了正确的路由配置。对于 React Router，在使用 BrowserRouter 时，GitHub Pages 需要特殊配置。
- 在 `dist` 目录中添加 `.nojekyll` 文件，防止 GitHub Pages 忽略下划线开头的文件。本项目的部署工作流中已包含此步骤。
- 确保 Vite 配置正确，特别是 `base` 路径设置。

**问题**: 部署成功但页面样式或脚本加载失败。

**解决方案**:
- 检查浏览器控制台的网络请求，确认资源路径是否正确
- 确认 `vite.config.ts` 中的 `base` 配置是否正确。如果您的仓库不是顶级域名，可能需要设置为 `/<仓库名>/`
- 确保构建过程中没有错误，所有资源都正确打包到 `dist` 目录

---

希望本指南能帮助您成功部署 ContentCreator 项目！如有其他问题，请随时咨询。