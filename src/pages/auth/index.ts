import { bootstrapUser } from '../../services/auth'

Page({
  data: {
    loading: false,
    nickName: '',
    avatarUrl: ''
  },
  async onChooseAvatar(event: WechatMiniprogram.CustomEvent<{ avatarUrl: string }>) {
    this.setData({ avatarUrl: event.detail.avatarUrl })
  },
  onNicknameInput(event: WechatMiniprogram.Input) {
    this.setData({ nickName: event.detail.value })
  },
  async submitProfile() {
    const nickName = this.data.nickName.trim()
    if (!nickName) {
      wx.showToast({ title: '请填写昵称', icon: 'none' })
      return
    }
    if (!this.data.avatarUrl) {
      wx.showToast({ title: '请先选择头像', icon: 'none' })
      return
    }
    if (this.data.loading) return

    try {
      this.setData({ loading: true })
      const result = await bootstrapUser({
        nickName,
        avatarUrl: this.data.avatarUrl
      })
      const app = getApp<IAppOption>()
      app.globalData.userInfo = result.user
      app.globalData.currentCircleId = result.user.defaultCircleId || ''

      if (result.hasCircle) {
        wx.reLaunch({ url: '/pages/leaderboard/index' })
      } else {
        wx.reLaunch({ url: '/pages/create-circle/index' })
      }
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '保存失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
