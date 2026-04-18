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
    const pageNo = Number(event.pageNo) > 0 ? Number(event.pageNo) : 1
    const pageSize = Number(event.pageSize) > 0 ? Number(event.pageSize) : 20

    let where = { openid }
    if (circleId) {
      where = { ...where, circleId }
    }

    const countRes = await db.collection('records').where(where).count()
    const recordsRes = await db.collection('records')
      .where(where)
      .orderBy('createTime', 'desc')
      .skip((pageNo - 1) * pageSize)
      .limit(pageSize)
      .get()

    return ok({
      pageNo,
      pageSize,
      total: countRes.total,
      list: recordsRes.data.map((item) => ({
        recordId: item._id,
        circleId: item.circleId,
        type: item.type,
        value: item.value,
        createTime: item.createTime,
        date: item.date
      }))
    })
  } catch (error) {
    return fail('SYSTEM_ERROR', error.message || 'getMyRecords 执行失败')
  }
}
