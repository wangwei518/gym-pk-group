import { getShareInfo, joinCircle } from '../../services/circle'
import type { PKCircle } from '../../types/circle'

Page({
  data: {
    inviteCode: '',
    circle: null as PKCircle | null,
    loading: false
  },
  onLoad(query: Record<string, string>) {
    const inviteCode = decodeURIComponent(query.inviteCode || '')
    this.setData({ inviteCode })
    if (inviteCode) {
      void this.loadShareInfo(inviteCode)
    }
  },
  async loadShareInfo(inviteCode: string) {
    try {
      const circle = await getShareInfo({ inviteCode })
      this.setData({ circle })
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '加载失败', icon: 'none' })
    }
  },
  async confirmJoin() {
    if (!this.data.inviteCode || this.data.loading) return
    try {
      this.setData({ loading: true })
      const result = await joinCircle({ inviteCode: this.data.inviteCode })
      const app = getApp<IAppOption>()
      app.globalData.currentCircleId = result.circle.circleId
      wx.showToast({ title: '加入成功', icon: 'success' })
      setTimeout(() => wx.switchTab({ url: '/pages/leaderboard/index' }), 400)
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '加入失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
