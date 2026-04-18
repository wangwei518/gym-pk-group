const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const ok = (data) => ({ success: true, code: 'OK', message: '', data })
const fail = (code, message) => ({ success: false, code, message, data: null })

exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    if (!openid) return fail('UNAUTHORIZED', '未获取到用户身份')

    const circleId = (event.circleId || '').trim()
    const userRes = await db.collection('users').where({ openid }).limit(1).get()
    if (!userRes.data.length) return fail('USER_NOT_FOUND', '未找到用户信息')
    const user = userRes.data[0]

    const userStatsRes = await db.collection('user_stats').where({ openid }).limit(1).get()
    const totals = userStatsRes.data[0] || {
      totalPullup: 0,
      totalRope: 0,
      totalRock: 0,
      totalRun: 0
    }

    let circle = null
    let circleTotals = null

    if (circleId) {
      const memberRes = await db.collection('circle_members').where({ circleId, openid, status: 'normal' }).limit(1).get()
      if (memberRes.data.length) {
        const circleRes = await db.collection('pk_circles').doc(circleId).get()
        circle = {
          circleId,
          name: circleRes.data.name,
          memberCount: circleRes.data.memberCount,
          inviteCode: circleRes.data.inviteCode
        }
        const circleStatsRes = await db.collection('circle_user_stats').where({ circleId, openid }).limit(1).get()
        if (circleStatsRes.data.length) {
          const item = circleStatsRes.data[0]
          circleTotals = {
            totalPullup: item.totalPullup,
            totalRope: item.totalRope,
            totalRock: item.totalRock,
            totalRun: item.totalRun
          }
        }
      }
    }

    return ok({
      user: {
        openid,
        nickName: user.nickName || '微信用户',
        avatarUrl: user.avatarUrl || '',
        defaultCircleId: user.defaultCircleId || ''
      },
      circle,
      totals: {
        totalPullup: totals.totalPullup || 0,
        totalRope: totals.totalRope || 0,
        totalRock: totals.totalRock || 0,
        totalRun: totals.totalRun || 0
      },
      circleTotals
    })
  } catch (error) {
    return fail('SYSTEM_ERROR', error.message || 'getMyProfile 执行失败')
  }
}
