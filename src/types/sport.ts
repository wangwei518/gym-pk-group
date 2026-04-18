export type SportType = 'pullup' | 'rope' | 'rock' | 'run'

export interface SportMeta {
  key: SportType
  label: string
  unit: string
  allowDecimal: boolean
}

export const SPORT_META: SportMeta[] = [
  { key: 'pullup', label: '引体向上', unit: '次', allowDecimal: false },
  { key: 'rope', label: '跳绳', unit: '次', allowDecimal: false },
  { key: 'rock', label: '攀岩', unit: '次', allowDecimal: false },
  { key: 'run', label: '跑步', unit: '公里', allowDecimal: true }
]
