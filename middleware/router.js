import { Router } from '../decorator/router'
import { resolve } from 'path'

const router = (app) => {
  const routesPath = resolve(__dirname, '../routes')
  const instance = new Router(app, routesPath)
  instance.init()
}
export {
  router
}
