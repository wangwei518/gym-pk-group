const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const ok = (data) => ({ success: true, code: 'OK', message: '', data })
const fail = (code, message) => ({ success: false, code, message, data: null })

const fieldMap = {
  pullup: 'totalPullup',
  rope: 'totalRope',
  rock: 'totalRock',
  run: 'totalRun'
}

exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    if (!openid) return fail('UNAUTHORIZED', '未获取到用户身份')

    const circleId = (event.circleId || '').trim()
    const type = event.type
    const fieldName = fieldMap[type]

    if (!circleId) return fail('INVALID_CIRCLE_ID', 'circleId 不能为空')
    if (!fieldName) return fail('INVALID_SPORT_TYPE', '不支持的运动类型')

    const memberRes = await db.collection('circle_members').where({ circleId, openid, status: 'normal' }).limit(1).get()
    if (!memberRes.data.length) return fail('NOT_CIRCLE_MEMBER', '当前用户不在该 PK 圈内')

    const circleRes = await db.collection('pk_circles').doc(circleId).get()
    const statsRes = await db.collection('circle_user_stats').where({ circleId }).get()

    const openids = statsRes.data.map((item) => item.openid)
    let users = []
    if (openids.length) {
      const userQuery = await db.collection('users').where({ openid: db.command.in(openids) }).get()
      users = userQuery.data
    }
    const userMap = new Map(users.map((item) => [item.openid, item]))

    const list = statsRes.data
      .map((item) => {
        const user = userMap.get(item.openid) || {}
        return {
          openid: item.openid,
          nickName: user.nickName || '微信用户',
          avatarUrl: user.avatarUrl || '',
          value: item[fieldName] || 0,
          isSelf: item.openid === openid
        }
      })
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        rank: index + 1,
        ...item
      }))

    return ok({
      circle: {
        circleId,
        name: circleRes.data.name,
        memberCount: circleRes.data.memberCount,
        inviteCode: circleRes.data.inviteCode
      },
      type,
      list
    })
  } catch (error) {
    return fail('SYSTEM_ERROR', error.message || 'getLeaderboard 执行失败')
  }
}
