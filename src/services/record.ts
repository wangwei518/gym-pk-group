import { callCloudFunction } from './cloud'
import type { SportRecord, SubmitRecordPayload } from '../types/record'
import type { UserStats } from '../types/user'

export interface SubmitRecordResult {
  recordId: string
  type: string
  value: number
  userTotals: UserStats
  circleTotals: UserStats
}

export const submitRecord = (payload: SubmitRecordPayload) => {
  return callCloudFunction<SubmitRecordResult>('submitRecord', payload as unknown as Record<string, unknown>)
}

export const getMyRecords = (payload: { circleId?: string; pageNo?: number; pageSize?: number }) => {
  return callCloudFunction<{ pageNo: number; pageSize: number; total: number; list: SportRecord[] }>('getMyRecords', payload)
}
