# Render 部署指南

## 方法一：通过 Render Dashboard 部署（推荐）

### 步骤 1: 登录 Render
1. 访问 https://render.com
2. 使用 GitHub 账号登录（如果没有账号，先注册）

### 步骤 2: 创建新的静态网站
1. 点击 Dashboard 右上角的 **"New +"** 按钮
2. 选择 **"Static Site"**

### 步骤 3: 连接 GitHub 仓库
1. 在 "Connect a repository" 部分，选择或搜索你的仓库：`Heyolivia709/QingWen-YuweiMa-project2`
2. 如果第一次使用，需要授权 Render 访问你的 GitHub 账号

### 步骤 4: 配置构建设置
填写以下信息：

- **Name**: `sudoku-project` (或你喜欢的名称)
- **Branch**: `main`
- **Root Directory**: 留空（使用根目录）
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### 步骤 5: 环境变量（重要！）
在 "Environment Variables" 部分，添加以下环境变量：

- **Key**: `RENDER`
- **Value**: `true`

这个环境变量会让构建使用根路径（`/`）而不是子路径，适合 Render 部署。

可选环境变量：
- **Key**: `NODE_VERSION`
- **Value**: `20.x`

### 步骤 6: 部署
1. 点击 **"Create Static Site"**
2. Render 会自动开始构建和部署
3. 等待部署完成（通常需要 2-5 分钟）

### 步骤 7: 获取链接
部署完成后，你会得到一个 Render 提供的 URL，格式类似：
`https://sudoku-project.onrender.com`

## 方法二：使用 render.yaml 配置文件

如果你已经创建了 `render.yaml` 文件（我已经为你创建了），可以：

1. 在 Render Dashboard 中，选择你的服务
2. 进入 **Settings**
3. 在 "Infrastructure as Code" 部分，选择使用 `render.yaml`

## 重要提示

### 关于 Base Path
- **GitHub Pages**: 使用 `/QingWen-YuweiMa-project2/` 作为 base path
- **Render**: 使用 `/` 作为 base path（根路径）

如果你想要在 Render 上使用根路径，需要修改 `vite.config.js`：

```javascript
base: process.env.RENDER ? '/' : '/QingWen-YuweiMa-project2/',
```

或者创建两个不同的构建配置。

### 自动部署
- Render 会在你推送到 GitHub 的 `main` 分支时自动重新部署
- 你也可以在 Dashboard 中手动触发部署

### 自定义域名
- 在 Render Dashboard 的 Settings 中可以配置自定义域名
- 需要添加 DNS 记录指向 Render

## 故障排除

### 构建失败
- 检查构建日志中的错误信息
- 确保 `package.json` 中的依赖都正确
- 确保 Node.js 版本兼容（推荐 20.x）

### 图片不显示
- 检查图片路径是否正确
- 确保 `public` 文件夹中的文件被正确复制到 `dist`

### 路由不工作
- 确保在 Render 中配置了正确的重定向规则
- 对于 React Router，需要将所有路由重定向到 `index.html`

## 费用
- Render 的静态网站托管是**免费的**
- 有使用限制，但对于个人项目通常足够

