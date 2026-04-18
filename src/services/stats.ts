import { callCloudFunction } from './cloud'
import type { PKCircle } from '../types/circle'
import type { SportType } from '../types/sport'
import type { UserInfo, UserStats } from '../types/user'

export interface LeaderboardItem {
  rank: number
  openid: string
  nickName: string
  avatarUrl: string
  value: number
  isSelf: boolean
}

export interface LeaderboardResult {
  circle: PKCircle
  type: SportType
  list: LeaderboardItem[]
}

export interface ProfileResult {
  user: UserInfo
  circle?: PKCircle
  totals: UserStats
  circleTotals?: UserStats
}

export const getLeaderboard = (payload: { circleId: string; type: SportType }) => {
  return callCloudFunction<LeaderboardResult>('getLeaderboard', payload)
}

export const getMyProfile = (payload: { circleId?: string }) => {
  return callCloudFunction<ProfileResult>('getMyProfile', payload)
}
