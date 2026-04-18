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

    const nickName = (event.nickName || '').trim()
    const avatarUrl = (event.avatarUrl || '').trim()
    if (!nickName) return fail('INVALID_PARAM', '昵称不能为空')
    if (!avatarUrl) return fail('INVALID_PARAM', '头像不能为空')

    const userRes = await db.collection('users').where({ openid }).limit(1).get()
    if (!userRes.data.length) return fail('USER_NOT_FOUND', '未找到用户信息')

    const user = userRes.data[0]
    const updateTime = new Date()
    await db.collection('users').doc(user._id).update({
      data: {
        nickName,
        avatarUrl,
        updateTime
      }
    })

    return ok({
      user: {
        openid,
        nickName,
        avatarUrl,
        defaultCircleId: user.defaultCircleId || ''
      }
    })
  } catch (error) {
    return fail('SYSTEM_ERROR', error.message || 'updateUserProfile 执行失败')
  }
}
