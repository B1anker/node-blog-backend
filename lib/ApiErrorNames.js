const ApiErrorNames = {}

ApiErrorNames.UNKNOW_ERROR = 'UNKNOW_ERROR'
ApiErrorNames.USER_NOT_EXIST = 'USER_NOT_EXIST'
ApiErrorNames.USER_NOT_LOGIN = 'USER_NOT_LOGIN'
ApiErrorNames.UNKNOW_ROLE_TYPE = 'UNKNOW_ROLE_TYPE'
ApiErrorNames.PASSPORT_INCORRECT = 'PASSPORT_INCORRECT'
ApiErrorNames.DATABASE_ERROR = 'DATABASE_ERROR'
ApiErrorNames.PERMISSION_DENIED = 'PERMISSION_DENIED'
ApiErrorNames.INVALID_OBJECTID = 'INVALID_OBJECTID'

const errorMap = new Map()

errorMap.set(ApiErrorNames.UNKNOW_ERROR, { code: 500, message: '未知错误' })
errorMap.set(ApiErrorNames.USER_NOT_EXIST, { code: 500, message: '用户不存在' })
errorMap.set(ApiErrorNames.USER_NOT_LOGIN, { code: 412, message: '用户未登录' })
errorMap.set(ApiErrorNames.UNKNOW_ROLE_TYPE, { code: 500, message: '未知的用户类型' })
errorMap.set(ApiErrorNames.PASSPORT_INCORRECT, { code: 500, message: '用户名或密码错误' })
errorMap.set(ApiErrorNames.DATABASE_ERROR, { code: 500, message: '数据库错误' })
errorMap.set(ApiErrorNames.PERMISSION_DENIED, { code: 500, message: '权限不足' })
errorMap.set(ApiErrorNames.INVALID_OBJECTID, { code: 500, message: '非法ObjectId' })

ApiErrorNames.getErrorInfo = (errorName) => {
  let errorInfo
  if (errorName) {
    errorInfo = errorMap.get(errorName)
  }

  if (!errorInfo) {
    errorName = ApiErrorNames.UNKNOW_ERROR
    errorInfo = errorMap.get(errorName)
  }
  return errorInfo
}

export default ApiErrorNames
