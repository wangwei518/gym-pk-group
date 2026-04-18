declare type SportType = 'pullup' | 'rope' | 'rock' | 'run'

declare interface IUserInfo {
  openid: string
  nickName: string
  avatarUrl: string
  defaultCircleId?: string
}

declare interface IAppOption {
  globalData: {
    userInfo: IUserInfo | null
    currentCircleId: string
    currentSportType: SportType
  }
}
