const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const now = () => new Date()
const ok = (data) => ({ success: true, code: 'OK', message: '', data })
const fail = (code, message) => ({ success: false, code, message, data: null })
const makeInviteCode = () => Math.random().toString(36).slice(2, 10).toUpperCase()

exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    if (!openid) return fail('UNAUTHORIZED', '未获取到用户身份')

    const name = (event.name || '').trim()
    if (!name || name.length > 20) {
      return fail('INVALID_PARAM', 'PK 圈名称长度需为 1 到 20 个字符')
    }

    const userRes = await db.collection('users').where({ openid }).limit(1).get()
    if (!userRes.data.length) {
      return fail('USER_NOT_FOUND', '请先初始化用户信息')
    }

    const user = userRes.data[0]
    if (user.defaultCircleId) {
      return fail('ALREADY_IN_OTHER_CIRCLE', '当前用户已加入固定 PK 圈')
    }

    const currentTime = now()
    const inviteCode = makeInviteCode()
    const circleAddRes = await db.collection('pk_circles').add({
      data: {
        name,
        ownerOpenid: openid,
        inviteCode,
        memberCount: 1,
        status: 'normal',
        createTime: currentTime,
        updateTime: currentTime
      }
    })

    const circleId = circleAddRes._id

    await db.collection('circle_members').add({
      data: {
        circleId,
        openid,
        role: 'owner',
        joinTime: currentTime,
        status: 'normal'
      }
    })

    await db.collection('circle_user_stats').add({
      data: {
        circleId,
        openid,
        totalPullup: 0,
        totalRope: 0,
        totalRock: 0,
        totalRun: 0,
        updateTime: currentTime
      }
    })

    await db.collection('users').doc(user._id).update({
      data: {
        defaultCircleId: circleId,
        updateTime: currentTime
      }
    })

    return ok({
      circle: {
        circleId,
        name,
        inviteCode,
        memberCount: 1
      }
    })
  } catch (error) {
    return fail('SYSTEM_ERROR', error.message || 'createCircle 执行失败')
  }
}
