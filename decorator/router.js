import { resolve } from 'path'
import KoaRouter from 'koa-router'
import glob from 'glob'
import R from 'ramda'
import ApiError from '../lib/ApiError'
import mongoose from 'mongoose'
const { ObjectId } = mongoose.Types

const pathPrefix = Symbol('pathPrefix')
const routeMap = []
let logTimes = 0

const resolvePath = R.unless(
  R.startsWith('/'),
  R.curryN(2, R.concat)('/')
)

const changeToArr = R.unless(
  R.is(Array),
  R.of
)

class Router {
  constructor (app, routesPath) {
    this.app = app
    this.router = new KoaRouter()
    this.routesPath = routesPath
  }

  init = () => {
    const { app, router, routesPath } = this

    glob.sync(resolve(routesPath, './*.js')).forEach(require)

    R.forEach(
      ({ target, method, path, callback }) => {
        const prefix = resolvePath(target[pathPrefix])
        router[method](prefix + path, ...callback)
      }
    )(routeMap)

    app.use(router.routes())
    app.use(router.allowedMethods())
  }
}

const convert = middleware => (target, key, descriptor) => {
  target[key] = R.compose(
    R.concat(
      changeToArr(middleware)
    ),
    changeToArr
  )(target[key])
  return descriptor
}

const setRouter = method => path => (target, key, descriptor) => {
  routeMap.push({
    target,
    method,
    path: resolvePath(path),
    callback: changeToArr(target[key])
  })
  return descriptor
}

const Controller = path => target => (target.prototype[pathPrefix] = path)

const Get = setRouter('get')

const Post = setRouter('post')

const Put = setRouter('put')

const Delete = setRouter('delete')

const Log = convert(async (ctx, next) => {
  logTimes++
  console.time(`${logTimes}: ${ctx.method} - ${ctx.url}`)
  await next()
  console.timeEnd(`${logTimes}: ${ctx.method} - ${ctx.url}`)
})

/**
 * @Required({
 *   body: ['name', 'password']
 * })
 */
const Required = paramsObj => convert(async (ctx, next) => {
  let errs = []

  R.forEachObjIndexed(
    (val, key) => {
      errs = errs.concat(
        R.filter(
          name => !R.has(name, ctx.request[key])
        )(val)
      )
    }
  )(paramsObj)

  if (!R.isEmpty(errs)) {
    throw new ApiError(`${R.join(', ', errs)} is required`, true)
  }
  await next()
})

const ValidObjectId = (type) => {
  return convert(async (ctx, next) => {
    const id = ctx.method === 'GET' ? ctx.params[type] : ctx.request.body[type]
    if (ObjectId.isValid(id)) {
      await next()
    } else {
      throw new ApiError('INVALID_OBJECTID', true)
    }
  })
}

const Auth = (role) => {
  if (!role) {
    role = ['user', 'admin', 'superAdmin']
  } else if (typeof role === 'string') {
    role = [role]
  }
  return convert(async (ctx, next) => {
    if (!ctx.session.user) {
      throw new ApiError('USER_NOT_LOGIN', true)
    } else if (!~role.indexOf(ctx.session.user.role)) {
      throw new ApiError('PERMISSION_DENIED', true)
    }
    await next()
  })
}

export {
  Router,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Log,
  Auth,
  Required,
  ValidObjectId
}
