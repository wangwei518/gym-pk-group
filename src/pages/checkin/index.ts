import { SPORT_META } from '../../types/sport'
import { validateRecordValue } from '../../utils/validate'

Page({
  data: {
    sportTabs: SPORT_META,
    type: 'pullup' as SportType,
    value: ''
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
  submit() {
    const error = validateRecordValue(this.data.type, this.data.value)
    if (error) {
      wx.showToast({ title: error, icon: 'none' })
      return
    }
    wx.showToast({ title: '打卡逻辑待接云函数', icon: 'none' })
  }
})
