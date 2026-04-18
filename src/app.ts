import { bootstrapUser } from './services/auth'

App({
  globalData: {
    userInfo: null as IUserInfo | null,
    currentCircleId: '',
    currentSportType: 'pullup' as SportType
  },
  async onLaunch() {
    console.log('gym-pk-group launched')
    if (!wx.cloud) {
      console.warn('当前基础库不支持云能力')
      return
    }

    wx.cloud.init({ traceUser: true })

    try {
      const result = await bootstrapUser({})
      this.globalData.userInfo = result.user
      this.globalData.currentCircleId = result.user.defaultCircleId || ''

      if (!result.hasCircle) {
        wx.reLaunch({ url: '/pages/create-circle/index' })
      }
    } catch (error) {
      console.error('bootstrapUser failed', error)
    }
  }
})
