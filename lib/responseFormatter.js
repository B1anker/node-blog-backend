import ApiError from './ApiError'

const formatter = async (ctx) => {
  if (ctx.body && ((ctx.body.code >= 200 && ctx.body.code < 300) || ctx.body.code === 304)) {
    const code = ctx.body.code
    delete ctx.body.code
    ctx.body = {
      code,
      message: 'success',
      data: ctx.body
    }
    if (!Object.keys(ctx.body.data).length) {
      delete ctx.body.data
    }
  }
}

const urlFilter = (pattern) => {
  return async function (ctx, next) {
    const reg = new RegExp(pattern)
    // 先去执行路由
    try {
      await next()
    } catch (err) {
      if (err instanceof ApiError && reg.test(ctx.originalUrl)) {
        ctx.throw(err.code, JSON.stringify({ message: err.message, name: err.name }), { expose: err.expose })
      } else {
        ctx.throw(err)
      }
    }
    if (reg.test(ctx.originalUrl)) {
      formatter(ctx)
    }
  }
}
export default urlFilter
