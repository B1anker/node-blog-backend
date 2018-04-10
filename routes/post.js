import {
  Controller,
  Post,
  Required,
  Auth,
  Put,
  Get
} from '../decorator/router'
import mongoose from 'mongoose'
// import ApiError from '../lib/ApiError'

const PostSchema = mongoose.model('Post')

@Controller('/api/v0/post')
class AdminRouter {
  @Get('list')
  async getList (ctx, next) {
    // const { lid } = ctx.session.user
    const data = await PostSchema.find()
    delete data.password
    ctx.body = {
      success: true,
      data
    }
  }

  @Post('/add')
  @Auth('admin')
  @Required({
    body: ['title', 'content']
  })
  async addPost (ctx, next) {
    const body = ctx.request.body
    const post = new PostSchema(body)
    post.save()

    return (ctx.body = {
      code: 200
    })
  }
}

export default AdminRouter
