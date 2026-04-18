import type { SportType } from './sport'

export interface SportRecord {
  recordId: string
  circleId: string
  type: SportType
  value: number
  createTime: string
  date: string
}

export interface SubmitRecordPayload {
  circleId: string
  type: SportType
  value: number
}
