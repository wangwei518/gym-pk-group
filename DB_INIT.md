# gym-pk-group 数据库初始化说明

这个文件用于补齐微信云开发数据库初始化步骤，减少手工配置遗漏。

## 1. 当前策略

当前项目采用的是：
- **代码里约定集合与索引结构**
- **实际集合和索引由你在微信云开发控制台或开发者工具中创建**

原因很简单：
- 微信云开发对“自动创建集合和索引”的支持不如传统后端数据库那样直接
- 实际联调阶段，手工创建一次通常更稳
- 但为了避免忘记该建什么，我已经把目标结构落到了模板文件里

模板文件：
- `scripts/db-init-template.js`

你可以执行：
```bash
node scripts/db-init-template.js
```

它会输出所有建议创建的集合与索引定义，用来对照控制台配置。

---

## 2. 需要创建的集合

按下面顺序创建：

1. `users`
2. `pk_circles`
3. `circle_members`
4. `records`
5. `user_stats`
6. `circle_user_stats`

---

## 3. 索引创建清单

## 3.1 users
### 索引
- `openid`，升序，唯一

---

## 3.2 pk_circles
### 索引
- `inviteCode`，升序
- `ownerOpenid`，升序

---

## 3.3 circle_members
### 索引
- `circleId + openid`，组合索引
- `openid`，升序

---

## 3.4 records
### 索引
- `circleId + type + createTime`
- `openid + createTime`
- `date`

说明：
- 排行榜相关查询会依赖 `circleId + type`
- 个人记录页会依赖 `openid + createTime`
- 如果后面增加“按天统计”，`date` 索引会有用

---

## 3.5 user_stats
### 索引
- `openid`，升序，唯一

---

## 3.6 circle_user_stats
### 索引
- `circleId + openid`，组合索引，唯一

---

## 4. 建议的初始化顺序

### 第一步，创建集合
在微信开发者工具的云开发数据库中，逐个新建以上 6 个集合。

### 第二步，创建索引
按本文件和 `scripts/db-init-template.js` 的定义，逐个创建索引。

### 第三步，上传并部署云函数
先确保云函数都上传成功：
- `bootstrapUser`
- `createCircle`
- `joinCircle`
- `submitRecord`
- `getLeaderboard`
- `getMyProfile`
- `getMyRecords`

### 第四步，首次运行联调
启动小程序并检查是否成功写入第一批数据。

---

## 5. 初始化后你应该看到什么

### 首次进入小程序后
应该自动产生：
- `users` 里的 1 条记录
- `user_stats` 里的 1 条记录

### 创建 PK 圈后
应该新增：
- `pk_circles` 里的 1 条记录
- `circle_members` 里的 1 条记录
- `circle_user_stats` 里的 1 条记录
- `users.defaultCircleId` 被更新

### 打卡后
应该新增或更新：
- `records` 新增 1 条
- `user_stats` 对应项目累计值增加
- `circle_user_stats` 对应项目累计值增加

---

## 6. 常见问题

### 6.1 排行榜为空
优先检查：
- 当前用户是否已加入 `circle_members`
- `circle_user_stats` 是否已初始化
- `submitRecord` 是否成功更新统计表

### 6.2 join-circle 加入失败
优先检查：
- `inviteCode` 是否正确
- `pk_circles.status` 是否为 `normal`
- 当前用户是否已经有别的 `defaultCircleId`

### 6.3 个人页没有记录
优先检查：
- `records` 集合是否已写入
- `circleId` 是否传递正确
- 当前 openid 是否一致

---

## 7. 后续可升级方向

后面如果你想进一步自动化，可以做：
- 用管理脚本自动检查集合是否存在
- 自动导出索引定义 JSON
- 编写更完整的数据库迁移文档
- 对不同环境（dev/test/prod）拆分配置

当前阶段我建议先保持“半自动”，最稳。
