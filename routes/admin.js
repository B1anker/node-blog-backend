import {
  Controller,
  Post,
  Required,
  Auth,
  Put,
  Get
} from '../decorator/router'
import { checkPassword, changeRole, getUserInfo } from '../service/admin'
import mongoose from 'mongoose'
import ApiError from '../lib/ApiError'

const User = mongoose.model('User')

@Controller('/api/v0/admin')
class AdminRouter {
  @Get('info')
  @Auth()
  async getUserInfo (ctx, next) {
    const { username } = ctx.session.user
    const data = await getUserInfo(username)
    delete data.password
    ctx.body = {
      success: true,
      data: {
        username: data.username,
        email: data.email,
        role: data.role
      }
    }
  }

  @Post('/login')
  @Required({
    body: ['username', 'password']
  })
  async adminLogin (ctx, next) {
    const { username, password } = ctx.request.body
    const data = await checkPassword(username, password)
    const { user, match } = data

    if (match) {
      ctx.session.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
        username: user.username
      }

      return (ctx.body = {
        success: true,
        data: {
          email: user.email,
          username: user.username
        }
      })
    }

    throw new ApiError('PASSPORT_INCORRECT', true)
  }

  @Post('/signup')
  @Required({
    body: ['email', 'password', 'username']
  })
  @Auth()
  async adminSignup (ctx, next) {
    const { email, password, username } = ctx.request.body
    const user = new User({
      email,
      password,
      username
    })
    user.save()

    return (ctx.body = {
      code: 200
    })
  }

  @Put('/changeRole')
  @Required({
    body: ['roleType', 'username']
  })
  @Auth(['admin', 'superAdmin'])
  async changeUserRole (ctx, next) {
    const { roleType, username } = ctx.request.body
    const role = ctx.session.user.role
    if (roleType === 'superAdmin' && role !== 'superAdmin') {
      throw new ApiError('PERMISSION_DENIED', true)
    }
    const user = await changeRole(roleType, username)
    if (user.username === ctx.session.user.username) {
      ctx.session.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
        username: user.username
      }
    }
    ctx.body = {
      code: 200
    }
  }
}

export default AdminRouter
