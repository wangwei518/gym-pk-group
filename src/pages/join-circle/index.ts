Page({
  data: {
    inviteCode: '',
    circle: {
      name: '待加入好友 PK 圈',
      memberCount: 0
    }
  },
  onLoad(query: Record<string, string>) {
    const inviteCode = query.inviteCode || ''
    this.setData({ inviteCode })
  },
  confirmJoin() {
    wx.showToast({ title: '加入逻辑待接云函数', icon: 'none' })
  }
})
