import {
  Controller,
  Post,
  Required,
  Auth,
  Get
} from '../decorator/router'
import mongoose from 'mongoose'
// import ApiError from '../lib/ApiError'

const PostSchema = mongoose.model('Post')

@Controller('/api/v0/post')
class AdminRouter {
  @Get('/list')
  async getPosts (ctx, next) {
    const data = await PostSchema.find()
    ctx.body = {
      success: true,
      data
    }
  }

  @Get(':pid')
  async getPost (ctx, next) {
    const { pid } = ctx.params
    console.log(ctx.params)
    const data = await PostSchema.findOne({_id: pid})
    ctx.body = {
      success: true,
      data: [data]
    }
  }

  @Post('/add')
  @Auth(['admin', 'superAdmin'])
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
