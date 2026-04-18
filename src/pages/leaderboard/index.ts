import { SPORT_META } from '../../types/sport'
import { getLeaderboard } from '../../services/stats'
import type { LeaderboardItem } from '../../services/stats'
import type { PKCircle } from '../../types/circle'

Page({
  data: {
    sportTabs: SPORT_META,
    currentSportType: 'pullup' as SportType,
    circle: null as PKCircle | null,
    list: [] as LeaderboardItem[]
  },
  onShow() {
    void this.loadLeaderboard()
  },
  async loadLeaderboard() {
    const app = getApp<IAppOption>()
    const circleId = app.globalData.currentCircleId || app.globalData.userInfo?.defaultCircleId
    if (!circleId) return
    try {
      const result = await getLeaderboard({
        circleId,
        type: this.data.currentSportType
      })
      this.setData({
        circle: result.circle,
        list: result.list
      })
      if (!app.globalData.currentCircleId) {
        app.globalData.currentCircleId = result.circle.circleId
      }
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '加载排行榜失败', icon: 'none' })
    }
  },
  onSportChange(event: WechatMiniprogram.CustomEvent<{ type: SportType }>) {
    this.setData({ currentSportType: event.detail.type })
    void this.loadLeaderboard()
  },
  goToCheckin() {
    wx.navigateTo({ url: `/pages/checkin/index?type=${this.data.currentSportType}` })
  },
  onShareAppMessage() {
    const circle = this.data.circle
    if (!circle?.inviteCode) {
      return {
        title: '来一起运动打卡 PK',
        path: '/pages/create-circle/index'
      }
    }
    return {
      title: `加入「${circle.name}」好友 PK 圈，一起打卡`,
      path: `/pages/join-circle/index?inviteCode=${circle.inviteCode}`
    }
  }
})
