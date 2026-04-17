Page({
  data: {
    title: 'Gym PK Group',
    subtitle: '训练打卡，组队 PK',
    stats: [
      { label: '今日打卡', value: '12' },
      { label: '活跃队伍', value: '4' },
      { label: '连胜天数', value: '7' }
    ]
  },
  onLoad() {
    console.log('index page loaded')
  }
})
