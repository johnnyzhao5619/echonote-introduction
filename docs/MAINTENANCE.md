# 维护指南

## 内容更新

### 多语言内容

翻译文件位于 `src/locales/` 目录：
- `zh-CN.json` - 简体中文
- `zh-TW.json` - 繁体中文  
- `en.json` - 英文
- `fr.json` - 法文

### 版本信息同步

版本信息会自动从主项目同步，也可以手动更新 `src/data/content.ts`。

## 依赖更新

定期检查和更新依赖包：

```bash
npm audit
npm update
```

## 性能监控

使用 Lighthouse 检查性能：

```bash
npm run build
npm run preview
# 在浏览器中运行 Lighthouse 审计
```