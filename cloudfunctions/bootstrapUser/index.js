exports.main = async (event, context) => {
  return {
    success: true,
    code: 'NOT_IMPLEMENTED',
    message: 'bootstrapUser scaffold is ready',
    data: {
      functionName: 'bootstrapUser',
      event
    }
  }
}
