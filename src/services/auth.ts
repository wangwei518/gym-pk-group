import { callCloudFunction } from './cloud'
import type { UserInfo } from '../types/user'

export interface BootstrapUserResult {
  user: UserInfo
  isNewUser: boolean
  hasCircle: boolean
}

export const bootstrapUser = (payload: Partial<UserInfo>) => {
  return callCloudFunction<BootstrapUserResult>('bootstrapUser', payload)
}
