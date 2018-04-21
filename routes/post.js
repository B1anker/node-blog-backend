import {
  Controller,
  Post,
  Required,
  Auth,
  Get,
  ValidObjectId
} from '../decorator/router'
import mongoose from 'mongoose'
import omit from 'lodash/omit'
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
  @ValidObjectId('pid')
  async getPost (ctx, next) {
    const { pid } = ctx.params
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

  @Post('/update')
  @Auth(['admin', 'superAdmin'])
  @ValidObjectId('pid')
  @Required({
    body: ['pid']
  })
  async updatePost (ctx, next) {
    const body = ctx.request.body
    const post = PostSchema.findOne({
      _id: body.pid
    }).exec()
    Object.assign(post, omit(body, ['pid']))
    console.log(post)
    post.save()
    // post.save()

    return (ctx.body = {
      code: 200
    })
  }
}

export default AdminRouter
