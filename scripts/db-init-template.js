/*
 * gym-pk-group 数据库初始化模板
 *
 * 用途：
 * 1. 作为云开发数据库集合/索引初始化参考
 * 2. 方便后续迁移成真正的自动化初始化脚本
 *
 * 说明：
 * - 微信云开发当前更常见的做法，是在控制台或开发者工具里创建集合和索引
 * - 这个文件主要负责把“该建什么”明确写死，避免手工漏项
 */

const collections = [
  {
    name: 'users',
    indexes: [
      { fields: [{ name: 'openid', order: 'asc' }], options: { unique: true } }
    ]
  },
  {
    name: 'pk_circles',
    indexes: [
      { fields: [{ name: 'inviteCode', order: 'asc' }], options: { unique: false } },
      { fields: [{ name: 'ownerOpenid', order: 'asc' }], options: { unique: false } }
    ]
  },
  {
    name: 'circle_members',
    indexes: [
      {
        fields: [
          { name: 'circleId', order: 'asc' },
          { name: 'openid', order: 'asc' }
        ],
        options: { unique: false }
      },
      { fields: [{ name: 'openid', order: 'asc' }], options: { unique: false } }
    ]
  },
  {
    name: 'records',
    indexes: [
      {
        fields: [
          { name: 'circleId', order: 'asc' },
          { name: 'type', order: 'asc' },
          { name: 'createTime', order: 'desc' }
        ],
        options: { unique: false }
      },
      {
        fields: [
          { name: 'openid', order: 'asc' },
          { name: 'createTime', order: 'desc' }
        ],
        options: { unique: false }
      },
      { fields: [{ name: 'date', order: 'asc' }], options: { unique: false } }
    ]
  },
  {
    name: 'user_stats',
    indexes: [
      { fields: [{ name: 'openid', order: 'asc' }], options: { unique: true } }
    ]
  },
  {
    name: 'circle_user_stats',
    indexes: [
      {
        fields: [
          { name: 'circleId', order: 'asc' },
          { name: 'openid', order: 'asc' }
        ],
        options: { unique: true }
      }
    ]
  }
]

console.log(JSON.stringify(collections, null, 2))
