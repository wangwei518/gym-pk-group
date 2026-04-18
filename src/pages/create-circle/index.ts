import { createCircle } from '../../services/circle'

Page({
  data: {
    name: '',
    loading: false
  },
  onInput(event: WechatMiniprogram.Input) {
    this.setData({ name: event.detail.value })
  },
  async submit() {
    const name = this.data.name.trim()
    if (!name) {
      wx.showToast({ title: '请输入 PK 圈名称', icon: 'none' })
      return
    }
    if (this.data.loading) return
    try {
      this.setData({ loading: true })
      const result = await createCircle({ name })
      const app = getApp<IAppOption>()
      app.globalData.currentCircleId = result.circle.circleId
      wx.showToast({ title: '创建成功', icon: 'success' })
      setTimeout(() => wx.switchTab({ url: '/pages/leaderboard/index' }), 400)
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '创建失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
