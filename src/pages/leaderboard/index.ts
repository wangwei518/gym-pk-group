import { SPORT_META } from '../../types/sport'

Page({
  data: {
    sportTabs: SPORT_META,
    currentSportType: 'pullup' as SportType,
    circle: {
      name: '好友 PK 圈',
      memberCount: 0
    },
    list: []
  },
  onSportChange(event: WechatMiniprogram.CustomEvent<{ type: SportType }>) {
    this.setData({ currentSportType: event.detail.type })
  },
  goToCheckin() {
    wx.navigateTo({ url: `/pages/checkin/index?type=${this.data.currentSportType}` })
  }
})
