Component({
  properties: {
    tabs: { type: Array, value: [] },
    current: { type: String, value: 'pullup' }
  },
  methods: {
    onTap(event: WechatMiniprogram.BaseEvent) {
      const type = event.currentTarget.dataset.type
      this.triggerEvent('change', { type })
    }
  }
})
