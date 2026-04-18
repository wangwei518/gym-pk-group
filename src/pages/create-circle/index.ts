Page({
  data: {
    name: ''
  },
  onInput(event: WechatMiniprogram.Input) {
    this.setData({ name: event.detail.value })
  },
  submit() {
    if (!this.data.name.trim()) {
      wx.showToast({ title: '请输入 PK 圈名称', icon: 'none' })
      return
    }
    wx.showToast({ title: '创建逻辑待接云函数', icon: 'none' })
  }
})
