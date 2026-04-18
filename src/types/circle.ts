export interface PKCircle {
  circleId: string
  name: string
  memberCount: number
  inviteCode?: string
}

export interface CircleMember {
  circleId: string
  openid: string
  role: 'owner' | 'member'
  joinTime: string
}
