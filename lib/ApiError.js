import ApiErrorNames from './ApiErrorNames'

class ApiError extends Error {
  constructor (errorName, expose = false) {
    super()
    const errorInfo = ApiErrorNames.getErrorInfo(errorName)
    this.name = errorName
    this.code = errorInfo.code
    this.message = errorInfo.message
    this.expose = expose
  }
}

export default ApiError
