export interface CloudResult<T> {
  success: boolean
  code: string
  message: string
  data: T
}

export const callCloudFunction = async <T>(name: string, data?: Record<string, unknown>): Promise<T> => {
  const res = (await wx.cloud.callFunction({
    name,
    data: data || {}
  })) as unknown as { result: CloudResult<T> }
  const result = res.result
  if (!result.success) {
    throw new Error(result.message || result.code || '云函数调用失败')
  }
  return result.data
}
