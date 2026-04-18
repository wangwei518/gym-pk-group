# gym-pk-group 接口与云函数设计

基于 `PRS.md` v2.1 和 `TASKS.md`，面向第一阶段 MVP：好友 PK 圈、运动打卡、排行榜、个人页。

## 1. 设计原则
- 前端尽量少做跨集合多次写操作
- 关键写操作通过云函数统一处理，保证幂等性和数据一致性
- 查询优先读聚合表，避免频繁扫明细表
- 返回结构统一，便于前端状态管理

统一返回建议：
```json
{
  "success": true,
  "code": "OK",
  "message": "",
  "data": {}
}
```

失败示例：
```json
{
  "success": false,
  "code": "INVALID_PARAM",
  "message": "跑步里程最多保留1位小数"
}
```

---

## 2. 云函数总览

第一阶段建议至少实现以下云函数：

1. `bootstrapUser`
2. `createCircle`
3. `joinCircle`
4. `submitRecord`
5. `getLeaderboard`
6. `getMyProfile`
7. `getMyRecords`

可选补充：
8. `getCircleDetail`
9. `getShareInfo`

---

## 3. 云函数设计

## 3.1 bootstrapUser

### 目标
初始化用户登录态相关数据。首次进入时创建用户及累计统计记录，非首次进入时更新最近登录时间。

### 调用时机
- 小程序启动后
- 用户完成登录后

### 入参
```ts
interface BootstrapUserInput {
  nickName?: string
  avatarUrl?: string
}
```

### 出参
```ts
interface BootstrapUserOutput {
  user: {
    openid: string
    nickName: string
    avatarUrl: string
    defaultCircleId?: string
  }
  isNewUser: boolean
  hasCircle: boolean
}
```

### 逻辑
- 从云函数上下文获取 openid
- 查询 `users` 是否存在
- 不存在则创建 `users`
- 不存在则初始化 `user_stats`
- 存在则更新 `lastLoginTime`
- 返回用户信息和是否已有默认 PK 圈

### 幂等要求
- 重复调用不能创建重复用户
- 重复调用不能重复初始化 `user_stats`

---

## 3.2 createCircle

### 目标
创建好友 PK 圈，并将创建人自动加入。

### 入参
```ts
interface CreateCircleInput {
  name: string
}
```

### 出参
```ts
interface CreateCircleOutput {
  circle: {
    circleId: string
    name: string
    inviteCode: string
    memberCount: number
  }
}
```

### 逻辑
- 校验名称非空、长度范围
- 获取当前用户 openid
- 检查当前用户是否已加入固定 PK 圈（MVP 若限制单圈，需要在此阻止重复创建）
- 创建 `pk_circles`
- 创建 `circle_members`
- 初始化当前用户 `circle_user_stats`
- 更新 `users.defaultCircleId`
- 返回创建结果

### 校验建议
- 名称长度：1 到 20 字
- 去除首尾空格
- 禁止纯空白字符

---

## 3.3 joinCircle

### 目标
用户通过分享入口加入指定好友 PK 圈。

### 入参
```ts
interface JoinCircleInput {
  inviteCode: string
}
```

### 出参
```ts
interface JoinCircleOutput {
  circle: {
    circleId: string
    name: string
    memberCount: number
  }
  joined: boolean
}
```

### 逻辑
- 根据 `inviteCode` 查询 `pk_circles`
- 校验 PK 圈存在且状态正常
- 获取当前 openid
- 若用户已加入该圈，直接返回 `joined: true`
- 若 MVP 限制单圈，且用户已加入其他圈，则返回错误
- 写入 `circle_members`
- 初始化该用户在 `circle_user_stats` 的记录
- 更新 `pk_circles.memberCount`
- 更新 `users.defaultCircleId`

### 错误码建议
- `CIRCLE_NOT_FOUND`
- `CIRCLE_DISABLED`
- `ALREADY_JOINED`
- `ALREADY_IN_OTHER_CIRCLE`

---

## 3.4 submitRecord

### 目标
提交一次运动打卡，并同步更新用户累计值和好友 PK 圈累计值。

### 入参
```ts
type SportType = 'pullup' | 'rope' | 'rock' | 'run'

interface SubmitRecordInput {
  circleId: string
  type: SportType
  value: number
}
```

### 出参
```ts
interface SubmitRecordOutput {
  recordId: string
  type: SportType
  value: number
  userTotals: {
    totalPullup: number
    totalRope: number
    totalRock: number
    totalRun: number
  }
  circleTotals: {
    totalPullup: number
    totalRope: number
    totalRock: number
    totalRun: number
  }
}
```

### 核心逻辑
- 校验 `circleId`
- 校验当前用户已加入该 PK 圈
- 校验运动类型合法
- 校验数值合法：
  - pullup/rope/rock 必须为正整数
  - run 必须大于 0，最多 1 位小数
- 生成当前日期字符串 `YYYY-MM-DD`
- 写入 `records`
- 更新 `user_stats`
- 更新 `circle_user_stats`
- 返回最新累计值

### 校验规则建议
```ts
pullup: integer > 0
rope: integer > 0
rock: integer > 0
run: number > 0 && decimalPlaces <= 1
```

### 并发与一致性建议
- 优先使用云数据库事务或原子自增能力
- 如果云开发事务受限，至少保证：
  1. 先写明细
  2. 再更新两个统计表
  3. 任一步失败则返回失败并记录日志

### 错误码建议
- `INVALID_CIRCLE_ID`
- `NOT_CIRCLE_MEMBER`
- `INVALID_SPORT_TYPE`
- `INVALID_RECORD_VALUE`
- `RECORD_CREATE_FAILED`
- `STATS_UPDATE_FAILED`

---

## 3.5 getLeaderboard

### 目标
获取当前好友 PK 圈某个项目的排行榜数据。

### 入参
```ts
interface GetLeaderboardInput {
  circleId: string
  type: SportType
}
```

### 出参
```ts
interface GetLeaderboardOutput {
  circle: {
    circleId: string
    name: string
    memberCount: number
  }
  type: SportType
  list: Array<{
    rank: number
    openid: string
    nickName: string
    avatarUrl: string
    value: number
    isSelf: boolean
  }>
}
```

### 逻辑
- 校验用户属于该 PK 圈
- 查询 `circle_user_stats`
- 根据 type 对应字段排序
- 关联 `users` 补昵称、头像
- 生成 rank、isSelf
- 返回排行榜列表

### 排序字段映射
- `pullup -> totalPullup`
- `rope -> totalRope`
- `rock -> totalRock`
- `run -> totalRun`

---

## 3.6 getMyProfile

### 目标
获取个人页所需的聚合信息。

### 入参
```ts
interface GetMyProfileInput {
  circleId?: string
}
```

### 出参
```ts
interface GetMyProfileOutput {
  user: {
    openid: string
    nickName: string
    avatarUrl: string
  }
  circle?: {
    circleId: string
    name: string
    memberCount: number
  }
  totals: {
    totalPullup: number
    totalRope: number
    totalRock: number
    totalRun: number
  }
  circleTotals?: {
    totalPullup: number
    totalRope: number
    totalRock: number
    totalRun: number
  }
}
```

### 逻辑
- 获取当前用户信息
- 查询 `user_stats`
- 若有 `circleId`，查询当前 PK 圈信息与 `circle_user_stats`
- 返回个人页展示所需聚合数据

---

## 3.7 getMyRecords

### 目标
获取当前用户历史打卡记录列表。

### 入参
```ts
interface GetMyRecordsInput {
  circleId?: string
  pageNo?: number
  pageSize?: number
}
```

### 出参
```ts
interface GetMyRecordsOutput {
  pageNo: number
  pageSize: number
  total: number
  list: Array<{
    recordId: string
    circleId: string
    type: SportType
    value: number
    createTime: string
    date: string
  }>
}
```

### 逻辑
- 按 openid 查询 `records`
- 支持按 `circleId` 过滤
- 按 `createTime` 倒序
- 支持分页

---

## 3.8 getCircleDetail（可选）

### 目标
获取分享进入页或首页顶部所需的 PK 圈基础信息。

### 入参
```ts
interface GetCircleDetailInput {
  circleId: string
}
```

### 出参
```ts
interface GetCircleDetailOutput {
  circleId: string
  name: string
  memberCount: number
  joined: boolean
}
```

---

## 3.9 getShareInfo（可选）

### 目标
根据邀请码返回分享页所需展示信息。

### 入参
```ts
interface GetShareInfoInput {
  inviteCode: string
}
```

### 出参
```ts
interface GetShareInfoOutput {
  circleId: string
  name: string
  memberCount: number
  ownerNickName?: string
}
```

---

## 4. 前端服务层设计

前端建议统一封装到 `services/`。

## 4.1 auth.ts
```ts
bootstrapUser(payload: BootstrapUserInput): Promise<BootstrapUserOutput>
```

## 4.2 circle.ts
```ts
createCircle(payload: CreateCircleInput): Promise<CreateCircleOutput>
joinCircle(payload: JoinCircleInput): Promise<JoinCircleOutput>
getCircleDetail(payload: GetCircleDetailInput): Promise<GetCircleDetailOutput>
getShareInfo(payload: GetShareInfoInput): Promise<GetShareInfoOutput>
```

## 4.3 record.ts
```ts
submitRecord(payload: SubmitRecordInput): Promise<SubmitRecordOutput>
getMyRecords(payload: GetMyRecordsInput): Promise<GetMyRecordsOutput>
```

## 4.4 stats.ts
```ts
getLeaderboard(payload: GetLeaderboardInput): Promise<GetLeaderboardOutput>
getMyProfile(payload: GetMyProfileInput): Promise<GetMyProfileOutput>
```

---

## 5. 页面与接口映射

### 5.1 启动页 / app 启动
- 调 `bootstrapUser`
- 判断是否已有 `defaultCircleId`
- 有则进入排行榜页
- 无则进入创建 PK 圈页或等待分享加入页

### 5.2 创建 PK 圈页
- 提交创建表单 -> `createCircle`
- 成功后跳转排行榜页

### 5.3 分享进入页 / 加入页
- 页面加载时调用 `getShareInfo`
- 用户确认加入 -> `joinCircle`
- 成功后跳转排行榜页

### 5.4 排行榜页
- 页面加载 -> `getLeaderboard`
- 项目切换 -> `getLeaderboard`
- 点击打卡 -> 跳打卡页

### 5.5 打卡页
- 提交 -> `submitRecord`
- 成功后返回排行榜页并刷新

### 5.6 个人页
- 页面加载 -> `getMyProfile`
- 历史记录区域 -> `getMyRecords`

---

## 6. 数据表示例

## 6.1 users
```json
{
  "openid": "o123",
  "nickName": "WangWei",
  "avatarUrl": "https://...",
  "status": "normal",
  "defaultCircleId": "circle_001",
  "lastLoginTime": "2026-04-17T17:50:00.000Z",
  "createTime": "2026-04-17T17:40:00.000Z",
  "updateTime": "2026-04-17T17:50:00.000Z"
}
```

## 6.2 pk_circles
```json
{
  "_id": "circle_001",
  "name": "周末燃脂 PK",
  "ownerOpenid": "o123",
  "inviteCode": "ABCD1234",
  "memberCount": 3,
  "status": "normal",
  "createTime": "2026-04-17T17:41:00.000Z",
  "updateTime": "2026-04-17T17:45:00.000Z"
}
```

## 6.3 records
```json
{
  "circleId": "circle_001",
  "openid": "o123",
  "type": "run",
  "value": 3.5,
  "source": "manual",
  "createTime": "2026-04-17T18:10:00.000Z",
  "date": "2026-04-17"
}
```

---

## 7. 错误码建议

```ts
OK
INVALID_PARAM
UNAUTHORIZED
USER_NOT_FOUND
CIRCLE_NOT_FOUND
CIRCLE_DISABLED
ALREADY_JOINED
ALREADY_IN_OTHER_CIRCLE
NOT_CIRCLE_MEMBER
INVALID_SPORT_TYPE
INVALID_RECORD_VALUE
RECORD_CREATE_FAILED
STATS_UPDATE_FAILED
SYSTEM_ERROR
```

---

## 8. 第一阶段推荐实现顺序
1. `bootstrapUser`
2. `createCircle`
3. `joinCircle`
4. `submitRecord`
5. `getLeaderboard`
6. `getMyProfile`
7. `getMyRecords`

---

## 9. 建议
- `submitRecord` 一定放云函数，别让前端自己写三张表
- `getLeaderboard` 一定读聚合表，不要扫 `records`
- `joinCircle` 和 `createCircle` 要做幂等
- MVP 先固定“一个用户一个 PK 圈”，可以明显降低复杂度
