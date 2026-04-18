# gym-pk-group 云开发联调与部署说明

本文用于把当前项目从“代码已完成主要骨架”推进到“微信开发者工具中可联调”。

## 1. 当前项目状态

当前已经完成：
- 小程序前端基础页面骨架
- 好友 PK 圈核心数据模型设计
- 7 个云函数目录与核心逻辑
- 启动初始化、创建 PK 圈、加入 PK 圈、打卡、排行榜、个人页、历史记录主流程代码

当前还需要你在微信开发者工具和云开发环境中完成接入。

---

## 2. 前置准备

你需要准备：
- 微信开发者工具
- 一个已注册的小程序 AppID
- 已开通的微信云开发环境
- 当前项目代码目录：`gym-pk-group`

建议先把 `project.config.json` 中的：
- `appid: touristappid`

替换成你自己的真实小程序 AppID。

---

## 3. 在微信开发者工具中导入项目

1. 打开微信开发者工具
2. 选择“导入项目”
3. 目录选择：
   - `gym-pk-group`
4. AppID 选择你自己的小程序 AppID
5. 导入后确认项目能正常打开

注意：
- 当前工程默认构建产物在 `dist/`
- 如果你使用本地构建流程，请先运行：

```bash
npm install
npm run build
```

然后在开发者工具中确认编译输出。

---

## 4. 开通并绑定云开发环境

### 4.1 开通云开发
在微信开发者工具中：
- 点击“云开发”
- 开通一个云开发环境
- 记录环境 ID，例如：`gym-pk-group-1gxxxxxx`

### 4.2 小程序中启用云能力
当前项目已在 `src/app.ts` 中调用：
```ts
wx.cloud.init({ traceUser: true })
```

如需指定环境，可改成：
```ts
wx.cloud.init({
  env: '你的环境ID',
  traceUser: true
})
```

如果不指定，默认使用当前环境。

---

## 5. 数据库集合创建

你需要在云开发数据库中创建以下集合：

1. `users`
2. `pk_circles`
3. `circle_members`
4. `records`
5. `user_stats`
6. `circle_user_stats`

建议先手工建立，后续再补自动初始化脚本。

---

## 6. 集合字段说明

## 6.1 users
```json
{
  "openid": "string",
  "nickName": "string",
  "avatarUrl": "string",
  "status": "normal",
  "defaultCircleId": "string",
  "lastLoginTime": "date",
  "createTime": "date",
  "updateTime": "date"
}
```

## 6.2 pk_circles
```json
{
  "name": "string",
  "ownerOpenid": "string",
  "inviteCode": "string",
  "memberCount": 1,
  "status": "normal",
  "createTime": "date",
  "updateTime": "date"
}
```

## 6.3 circle_members
```json
{
  "circleId": "string",
  "openid": "string",
  "role": "owner | member",
  "joinTime": "date",
  "status": "normal"
}
```

## 6.4 records
```json
{
  "circleId": "string",
  "openid": "string",
  "type": "pullup | rope | rock | run",
  "value": 1,
  "source": "manual",
  "createTime": "date",
  "date": "YYYY-MM-DD"
}
```

## 6.5 user_stats
```json
{
  "openid": "string",
  "totalPullup": 0,
  "totalRope": 0,
  "totalRock": 0,
  "totalRun": 0,
  "updateTime": "date"
}
```

## 6.6 circle_user_stats
```json
{
  "circleId": "string",
  "openid": "string",
  "totalPullup": 0,
  "totalRope": 0,
  "totalRock": 0,
  "totalRun": 0,
  "updateTime": "date"
}
```

---

## 7. 索引建议

为了避免后面查询变慢，建议创建以下索引。

### users
- `openid` 唯一索引

### pk_circles
- `inviteCode`
- `ownerOpenid`

### circle_members
- 组合索引：`circleId + openid`
- 单列索引：`openid`

### records
- 组合索引：`circleId + type + createTime`
- 组合索引：`openid + createTime`
- 单列索引：`date`

### user_stats
- `openid`

### circle_user_stats
- 组合索引：`circleId + openid`

---

## 8. 数据库权限建议

MVP 阶段建议：
- 前端不直接写核心集合
- 所有关键写操作通过云函数完成
- 查询也优先通过云函数统一访问

因此数据库权限建议尽量收紧，不要一开始就开放所有读写。

一个保守策略是：
- 数据库仅允许云函数读写
- 小程序端不直接访问数据库

这样更安全，也更符合当前代码结构。

---

## 9. 上传云函数

当前项目已有这些云函数目录：

- `bootstrapUser`
- `createCircle`
- `joinCircle`
- `submitRecord`
- `getLeaderboard`
- `getMyProfile`
- `getMyRecords`

### 上传方式
在微信开发者工具中：
1. 打开“云开发”面板
2. 进入“云函数”
3. 逐个右键对应函数目录
4. 选择“上传并部署：云端安装依赖”

建议按这个顺序上传：
1. `bootstrapUser`
2. `createCircle`
3. `joinCircle`
4. `submitRecord`
5. `getLeaderboard`
6. `getMyProfile`
7. `getMyRecords`

---

## 10. 首次联调顺序

建议按下面顺序联调，不要一上来全点一遍。

### 步骤 1，启动初始化
- 打开小程序
- 确认 `bootstrapUser` 正常执行
- 数据库中应生成：
  - `users`
  - `user_stats`

### 步骤 2，创建好友 PK 圈
- 进入创建页
- 输入 PK 圈名称
- 提交后检查数据库：
  - `pk_circles`
  - `circle_members`
  - `circle_user_stats`
  - `users.defaultCircleId`

### 步骤 3，打卡
- 进入打卡页
- 提交一条引体向上或跑步记录
- 检查数据库：
  - `records`
  - `user_stats`
  - `circle_user_stats`

### 步骤 4，排行榜和个人页
- 查看排行榜是否有数据
- 查看个人页是否有累计值和历史记录

---

## 11. 分享加入链路说明

当前代码已支持基于 `inviteCode` 加入 PK 圈。

但要真正完整跑起来，还需要确保：
- 分享出去的页面参数里带有 `inviteCode`
- 被邀请用户打开后进入 `join-circle` 页面
- 页面 query 中能拿到 `inviteCode`

这部分目前属于“下一步可继续打磨”的状态。

如果你要完整体验多人加入流程，下一步建议补：
- 页面分享配置
- 带参跳转逻辑
- 受邀打开后的路由承接

---

## 12. 当前已实现的云函数能力

### bootstrapUser
- 初始化用户
- 初始化用户累计统计

### createCircle
- 创建 PK 圈
- 将创建人加入圈
- 初始化圈内统计

### joinCircle
- 通过邀请码加入 PK 圈
- 幂等处理重复加入

### submitRecord
- 校验输入
- 写打卡明细
- 更新个人累计
- 更新圈内累计

### getLeaderboard
- 获取当前 PK 圈排行榜

### getMyProfile
- 获取个人信息和累计值

### getMyRecords
- 获取个人历史打卡记录

---

## 13. 已知限制

当前版本仍有这些限制，这是正常的：

1. 还没有做完整分享入口 UI
2. 云函数未做事务封装，当前是基础版写法
3. 排行榜页和个人页 UI 还比较基础
4. 还没有数据库初始化脚本
5. 还没有管理员能力和退出 PK 圈能力

这些都不影响 MVP 主链路联调。

---

## 14. 推荐下一步

建议继续按下面顺序做：

1. 补页面分享链路
2. 补数据库初始化脚本
3. 优化 UI 和错误态
4. 增加事务/异常恢复能力
5. 真实多人联调

---

## 15. 本地开发命令

安装依赖：
```bash
npm install
```

构建：
```bash
npm run build
```

监听构建：
```bash
npm run watch
```

---

## 16. 联调通过的最低标准

满足下面这些，就说明当前项目已经进入可用 MVP：

- 首次打开能生成用户数据
- 能创建一个好友 PK 圈
- 能提交至少一种运动打卡
- 排行榜能看到当前用户数据
- 个人页能看到累计值和历史记录

这 5 条一旦跑通，后面就是持续打磨而不是从零搭建了。
