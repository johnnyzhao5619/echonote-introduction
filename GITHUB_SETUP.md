# GitHub 仓库设置指南

## 1. 创建 GitHub 仓库

请按照以下步骤在 GitHub 上创建仓库：

### 步骤 1: 登录 GitHub

访问 [GitHub.com](https://github.com) 并登录您的账户 `johnnyzhao5619`

### 步骤 2: 创建新仓库

1. 点击右上角的 "+" 按钮
2. 选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `echonote-introduction`
   - **Description**: `EchoNote 项目介绍页面 - 智能语音转录和日历管理桌面应用程序`
   - **Visibility**: Public (推荐) 或 Private
   - **不要**勾选 "Add a README file"
   - **不要**勾选 "Add .gitignore"
   - **不要**勾选 "Choose a license"

### 步骤 3: 创建仓库

点击 "Create repository" 按钮

## 2. 推送代码到 GitHub

仓库创建完成后，运行以下命令推送代码：

```bash
cd echonote-introduction
git push -u origin main
```

## 3. 配置 GitHub Pages

### 步骤 1: 进入仓库设置

1. 在 GitHub 仓库页面，点击 "Settings" 标签
2. 在左侧菜单中找到 "Pages"

### 步骤 2: 配置 Pages 源

1. 在 "Source" 部分，选择 "GitHub Actions"
2. 这将启用 GitHub Actions 自动部署

### 步骤 3: 等待部署

- GitHub Actions 会自动运行部署流程
- 部署完成后，网站将在以下地址可用：
  `https://johnnyzhao5619.github.io/echonote-introduction`

## 4. 验证部署

### 检查 GitHub Actions

1. 在仓库页面点击 "Actions" 标签
2. 查看 "Deploy to GitHub Pages" 工作流状态
3. 确保所有步骤都成功完成

### 访问网站

部署成功后，访问：
`https://johnnyzhao5619.github.io/echonote-introduction`

## 5. 自动化部署

项目已配置自动化部署，每次推送到 `main` 分支时会自动：

1. 运行代码检查和测试
2. 构建生产版本
3. 部署到 GitHub Pages

## 故障排除

### 如果推送失败

```bash
# 检查远程仓库配置
git remote -v

# 如果需要重新配置
git remote set-url origin https://github.com/johnnyzhao5619/echonote-introduction.git
```

### 如果部署失败

1. 检查 GitHub Actions 日志
2. 确保仓库有 Pages 权限
3. 检查分支保护规则

### 如果网站无法访问

1. 确认 GitHub Pages 已启用
2. 检查自定义域名配置（如果有）
3. 等待 DNS 传播（可能需要几分钟）

## 联系支持

如果遇到问题，可以：

1. 查看 GitHub Pages 文档
2. 检查项目的 Issues 页面
3. 联系项目维护者

---

**注意**: 首次部署可能需要几分钟时间。请耐心等待 GitHub Actions 完成所有步骤。
