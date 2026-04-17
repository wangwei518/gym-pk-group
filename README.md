# gym-pk-group

微信小程序项目，使用 TypeScript 原生模版。

## 开发

```bash
npm install
npm run build
```

然后使用微信开发者工具导入项目，目录选择项目根目录，默认构建产物在 `dist/`。

## 目录结构

```
src/
  app.ts
  app.json
  app.wxss
  pages/
    index/
```

## 后续建议

- 把 `project.config.json` 里的 `appid` 改成你自己的小程序 AppID
- 如需云开发，可补充 `cloudfunctions/`
- 如需状态管理和接口层，可继续加 `services/`、`store/`、`utils/`
```
