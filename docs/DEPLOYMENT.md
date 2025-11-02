# 部署指南

## GitHub Pages 部署

本项目配置为自动部署到 GitHub Pages。

### 自动部署

推送到 `main` 分支时会自动触发部署流程。

### 手动部署

```bash
npm run build
# 将 dist 目录内容部署到 gh-pages 分支
```

## 本地开发

```bash
npm install
npm run dev
```

## 构建生产版本

```bash
npm run build
npm run preview
```