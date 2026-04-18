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
    if (!openid) {
      return fail('UNAUTHORIZED', '未获取到用户身份')
    }

    const nickName = (event.nickName || '').trim() || '微信用户'
    const avatarUrl = (event.avatarUrl || '').trim() || ''
    const currentTime = now()

    const userRes = await db.collection('users').where({ openid }).limit(1).get()
    let isNewUser = false
    let user

    if (!userRes.data.length) {
      isNewUser = true
      user = {
        openid,
        nickName,
        avatarUrl,
        status: 'normal',
        defaultCircleId: '',
        lastLoginTime: currentTime,
        createTime: currentTime,
        updateTime: currentTime
      }
      await db.collection('users').add({ data: user })
      await db.collection('user_stats').add({
        data: {
          openid,
          totalPullup: 0,
          totalRope: 0,
          totalRock: 0,
          totalRun: 0,
          updateTime: currentTime
        }
      })
    } else {
      user = userRes.data[0]
      await db.collection('users').doc(user._id).update({
        data: {
          lastLoginTime: currentTime,
          updateTime: currentTime,
          nickName: user.nickName || nickName,
          avatarUrl: user.avatarUrl || avatarUrl
        }
      })
      user = {
        ...user,
        lastLoginTime: currentTime,
        updateTime: currentTime,
        nickName: user.nickName || nickName,
        avatarUrl: user.avatarUrl || avatarUrl
      }

      const statsRes = await db.collection('user_stats').where({ openid }).limit(1).get()
      if (!statsRes.data.length) {
        await db.collection('user_stats').add({
          data: {
            openid,
            totalPullup: 0,
            totalRope: 0,
            totalRock: 0,
            totalRun: 0,
            updateTime: currentTime
          }
        })
      }
    }

    return ok({
      user: {
        openid,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        defaultCircleId: user.defaultCircleId || ''
      },
      isNewUser,
      hasCircle: Boolean(user.defaultCircleId)
    })
  } catch (error) {
    return fail('SYSTEM_ERROR', error.message || 'bootstrapUser 执行失败')
  }
}
