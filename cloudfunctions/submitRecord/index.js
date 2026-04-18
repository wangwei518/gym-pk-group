const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const now = () => new Date()
const ok = (data) => ({ success: true, code: 'OK', message: '', data })
const fail = (code, message) => ({ success: false, code, message, data: null })

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const validateValue = (type, value) => {
  if (!['pullup', 'rope', 'rock', 'run'].includes(type)) return '不支持的运动类型'
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) return '运动量必须大于 0'
  if (type === 'run') {
    if (!/^\d+(\.\d{1})?$/.test(String(value))) return '跑步里程最多保留 1 位小数'
    return ''
  }
  if (!Number.isInteger(value)) return '该项目仅支持正整数'
  return ''
}

const getFieldName = (type) => ({
  pullup: 'totalPullup',
  rope: 'totalRope',
  rock: 'totalRock',
  run: 'totalRun'
}[type])

exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    if (!openid) return fail('UNAUTHORIZED', '未获取到用户身份')

    const circleId = (event.circleId || '').trim()
    const type = event.type
    const value = Number(event.value)

    if (!circleId) return fail('INVALID_CIRCLE_ID', 'circleId 不能为空')
    const validationMessage = validateValue(type, value)
    if (validationMessage) return fail('INVALID_RECORD_VALUE', validationMessage)

    const memberRes = await db.collection('circle_members').where({ circleId, openid, status: 'normal' }).limit(1).get()
    if (!memberRes.data.length) return fail('NOT_CIRCLE_MEMBER', '当前用户不在该 PK 圈内')

    const currentTime = now()
    const date = formatDate(currentTime)
    const fieldName = getFieldName(type)

    const recordAddRes = await db.collection('records').add({
      data: {
        circleId,
        openid,
        type,
        value,
        source: 'manual',
        createTime: currentTime,
        date
      }
    })

    const userStatsRes = await db.collection('user_stats').where({ openid }).limit(1).get()
    if (!userStatsRes.data.length) return fail('USER_NOT_FOUND', '未找到用户累计统计')
    await db.collection('user_stats').doc(userStatsRes.data[0]._id).update({
      data: {
        [fieldName]: _.inc(value),
        updateTime: currentTime
      }
    })

    const circleStatsRes = await db.collection('circle_user_stats').where({ circleId, openid }).limit(1).get()
    if (!circleStatsRes.data.length) return fail('NOT_CIRCLE_MEMBER', '未找到圈内累计统计')
    await db.collection('circle_user_stats').doc(circleStatsRes.data[0]._id).update({
      data: {
        [fieldName]: _.inc(value),
        updateTime: currentTime
      }
    })

    const refreshedUserStats = await db.collection('user_stats').doc(userStatsRes.data[0]._id).get()
    const refreshedCircleStats = await db.collection('circle_user_stats').doc(circleStatsRes.data[0]._id).get()

    return ok({
      recordId: recordAddRes._id,
      type,
      value,
      userTotals: {
        totalPullup: refreshedUserStats.data.totalPullup,
        totalRope: refreshedUserStats.data.totalRope,
        totalRock: refreshedUserStats.data.totalRock,
        totalRun: refreshedUserStats.data.totalRun
      },
      circleTotals: {
        totalPullup: refreshedCircleStats.data.totalPullup,
        totalRope: refreshedCircleStats.data.totalRope,
        totalRock: refreshedCircleStats.data.totalRock,
        totalRun: refreshedCircleStats.data.totalRun
      }
    })
  } catch (error) {
    return fail('SYSTEM_ERROR', error.message || 'submitRecord 执行失败')
  }
}
