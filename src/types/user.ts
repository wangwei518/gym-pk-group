export interface UserInfo {
  openid: string
  nickName: string
  avatarUrl: string
  defaultCircleId?: string
}

export interface UserStats {
  totalPullup: number
  totalRope: number
  totalRock: number
  totalRun: number
}
