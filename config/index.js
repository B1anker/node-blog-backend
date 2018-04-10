const host = process.env.HOST || 'localhost'
const env = process.env.NODE_ENV || 'development'
const config = require(`./${env}`)

module.exports = Object.assign(
  {
    env,
    host
  },
  config
)
