import { bootstrapUser, updateUserProfile } from '../../services/auth'

Page({
  data: {
    loading: false,
    nickName: '',
    avatarUrl: '',
    mode: 'create' as 'create' | 'edit'
  },
  onLoad(query: Record<string, string>) {
    const mode = query.mode === 'edit' ? 'edit' : 'create'
    const app = getApp<IAppOption>()
    this.setData({
      mode,
      nickName: app.globalData.userInfo?.nickName || '',
      avatarUrl: app.globalData.userInfo?.avatarUrl || ''
    })
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
      const app = getApp<IAppOption>()

      if (this.data.mode === 'edit') {
        const result = await updateUserProfile({
          nickName,
          avatarUrl: this.data.avatarUrl
        })
        app.globalData.userInfo = result.user
        wx.showToast({ title: '资料已更新', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 400)
        return
      }

      const result = await bootstrapUser({
        nickName,
        avatarUrl: this.data.avatarUrl
      })
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
