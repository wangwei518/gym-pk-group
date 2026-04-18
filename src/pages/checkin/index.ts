import { SPORT_META } from '../../types/sport'
import { submitRecord } from '../../services/record'
import { validateRecordValue } from '../../utils/validate'

Page({
  data: {
    sportTabs: SPORT_META,
    type: 'pullup' as SportType,
    value: '',
    loading: false
  },
  onLoad(query: Record<string, string>) {
    if (query.type) {
      this.setData({ type: query.type as SportType })
    }
  },
  onTypeChange(event: WechatMiniprogram.CustomEvent<{ type: SportType }>) {
    this.setData({ type: event.detail.type })
  },
  onValueInput(event: WechatMiniprogram.Input) {
    this.setData({ value: event.detail.value })
  },
  async submit() {
    const error = validateRecordValue(this.data.type, this.data.value)
    if (error) {
      wx.showToast({ title: error, icon: 'none' })
      return
    }
    const app = getApp<IAppOption>()
    const circleId = app.globalData.currentCircleId || app.globalData.userInfo?.defaultCircleId
    if (!circleId) {
      wx.showToast({ title: '请先加入 PK 圈', icon: 'none' })
      return
    }
    if (this.data.loading) return
    try {
      this.setData({ loading: true })
      await submitRecord({
        circleId,
        type: this.data.type,
        value: Number(this.data.value)
      })
      wx.showToast({ title: '打卡成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    } catch (submitError) {
      wx.showToast({ title: submitError instanceof Error ? submitError.message : '提交失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
