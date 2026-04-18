import { getMyProfile } from '../../services/stats'
import { getMyRecords } from '../../services/record'

Page({
  data: {
    user: null as IUserInfo | null,
    circle: null as { name: string; memberCount: number; inviteCode?: string; circleId?: string } | null,
    totals: null as { totalPullup: number; totalRope: number; totalRock: number; totalRun: number } | null,
    records: [] as Array<{ recordId: string; type: string; value: number; date: string }>,
    loading: false
  },
  onShow() {
    void this.loadPageData()
  },
  async loadPageData() {
    const app = getApp<IAppOption>()
    const circleId = app.globalData.currentCircleId || app.globalData.userInfo?.defaultCircleId
    if (!circleId) return
    try {
      this.setData({ loading: true })
      const [profile, records] = await Promise.all([
        getMyProfile({ circleId }),
        getMyRecords({ circleId, pageNo: 1, pageSize: 20 })
      ])
      this.setData({
        user: profile.user,
        circle: profile.circle || null,
        totals: profile.totals,
        records: records.list.map((item) => ({
          recordId: item.recordId,
          type: item.type,
          value: item.value,
          date: item.date
        }))
      })
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },
  goEditProfile() {
    wx.navigateTo({ url: '/pages/auth/index?mode=edit' })
  }
})
