const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const now = () => new Date()
const ok = (data) => ({ success: true, code: 'OK', message: '', data })
const fail = (code, message) => ({ success: false, code, message, data: null })

exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    if (!openid) return fail('UNAUTHORIZED', '未获取到用户身份')

    const inviteCode = (event.inviteCode || '').trim()
    if (!inviteCode) return fail('INVALID_PARAM', 'inviteCode 不能为空')

    const userRes = await db.collection('users').where({ openid }).limit(1).get()
    if (!userRes.data.length) return fail('USER_NOT_FOUND', '请先初始化用户信息')
    const user = userRes.data[0]

    const circleRes = await db.collection('pk_circles').where({ inviteCode, status: 'normal' }).limit(1).get()
    if (!circleRes.data.length) return fail('CIRCLE_NOT_FOUND', '未找到对应 PK 圈')
    const circle = circleRes.data[0]

    const memberRes = await db.collection('circle_members').where({ circleId: circle._id, openid, status: 'normal' }).limit(1).get()
    if (memberRes.data.length) {
      if (!user.defaultCircleId) {
        await db.collection('users').doc(user._id).update({ data: { defaultCircleId: circle._id, updateTime: now() } })
      }
      return ok({
        circle: {
          circleId: circle._id,
          name: circle.name,
          memberCount: circle.memberCount
        },
        joined: true
      })
    }

    if (user.defaultCircleId && user.defaultCircleId !== circle._id) {
      return fail('ALREADY_IN_OTHER_CIRCLE', '当前用户已加入其他固定 PK 圈')
    }

    const currentTime = now()
    await db.collection('circle_members').add({
      data: {
        circleId: circle._id,
        openid,
        role: 'member',
        joinTime: currentTime,
        status: 'normal'
      }
    })

    const statsRes = await db.collection('circle_user_stats').where({ circleId: circle._id, openid }).limit(1).get()
    if (!statsRes.data.length) {
      await db.collection('circle_user_stats').add({
        data: {
          circleId: circle._id,
          openid,
          totalPullup: 0,
          totalRope: 0,
          totalRock: 0,
          totalRun: 0,
          updateTime: currentTime
        }
      })
    }

    await db.collection('pk_circles').doc(circle._id).update({
      data: {
        memberCount: _.inc(1),
        updateTime: currentTime
      }
    })

    await db.collection('users').doc(user._id).update({
      data: {
        defaultCircleId: circle._id,
        updateTime: currentTime
      }
    })

    return ok({
      circle: {
        circleId: circle._id,
        name: circle.name,
        memberCount: (circle.memberCount || 0) + 1
      },
      joined: true
    })
  } catch (error) {
    return fail('SYSTEM_ERROR', error.message || 'joinCircle 执行失败')
  }
}
