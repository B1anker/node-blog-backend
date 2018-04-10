import Koa from 'koa'
import R from 'ramda'
import chalk from 'chalk'
import path from 'path'
import config from './config'

const MIDDLEWARES = ['database', 'general', 'router']
const userMiddleware = (app) => {
  R.map(
    R.compose(
      R.forEachObjIndexed(
        e => e(app)
      ),
      require,
      name => path.join(__dirname, `./middleware/${name}`)
    )
  )(MIDDLEWARES)
}
const start = async () => {
  const app = new Koa()
  const { port } = config
  await userMiddleware(app)

  app.listen(port, (err) => {
    if (!err) {
      console.log(
        process.env.NODE_ENV === 'development'
          ? `Open ${chalk.green('http://localhost:' + port)}`
          : `App listening on port ${port}`
      )
    } else {
      chalk.red(err)
    }
  })
}

start()
