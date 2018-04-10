class ApiError extends Error {
  constructor (errorName) {
    super()
    this.name = errorName
  }
}
console.log(new ApiError('123') instanceof ApiError)
