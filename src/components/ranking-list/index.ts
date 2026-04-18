Component({
  properties: {
    list: { type: Array, value: [] },
    type: { type: String, value: 'pullup' }
  },
  data: {
    maxValue: 0
  },
  observers: {
    list(list: Array<{ value: number }>) {
      const maxValue = list.length ? list[0].value : 0
      this.setData({ maxValue })
    }
  }
})
