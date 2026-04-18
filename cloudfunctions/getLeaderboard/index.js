exports.main = async (event, context) => {
  return {
    success: true,
    code: 'NOT_IMPLEMENTED',
    message: 'getLeaderboard scaffold is ready',
    data: {
      functionName: 'getLeaderboard',
      event
    }
  }
}
