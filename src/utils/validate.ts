import type { SportType } from '../types/sport'

export const validateRecordValue = (type: SportType, rawValue: string): string => {
  if (!rawValue.trim()) return '请输入运动量'
  const value = Number(rawValue)
  if (Number.isNaN(value) || value <= 0) return '运动量必须大于 0'
  if (type === 'run') {
    if (!/^\d+(\.\d{1})?$/.test(rawValue)) return '跑步里程最多保留 1 位小数'
    return ''
  }
  if (!/^\d+$/.test(rawValue)) return '该项目仅支持正整数'
  return ''
}
