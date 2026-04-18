import { callCloudFunction } from './cloud'
import type { PKCircle } from '../types/circle'

export const createCircle = (payload: { name: string }) => {
  return callCloudFunction<{ circle: PKCircle }>('createCircle', payload)
}

export const joinCircle = (payload: { inviteCode: string }) => {
  return callCloudFunction<{ circle: PKCircle; joined: boolean }>('joinCircle', payload)
}

export const getCircleDetail = (payload: { circleId: string }) => {
  return callCloudFunction<PKCircle & { joined: boolean }>('getCircleDetail', payload)
}

export const getShareInfo = (payload: { inviteCode: string }) => {
  return callCloudFunction<PKCircle>('getShareInfo', payload)
}
