exports.main = async (event, context) => {
  return {
    success: true,
    code: 'NOT_IMPLEMENTED',
    message: 'getMyRecords scaffold is ready',
    data: {
      functionName: 'getMyRecords',
      event
    }
  }
}
