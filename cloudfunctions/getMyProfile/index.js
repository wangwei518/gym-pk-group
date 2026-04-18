exports.main = async (event, context) => {
  return {
    success: true,
    code: 'NOT_IMPLEMENTED',
    message: 'getMyProfile scaffold is ready',
    data: {
      functionName: 'getMyProfile',
      event
    }
  }
}
