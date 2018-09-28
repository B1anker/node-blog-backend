import {
  Controller,
  Delete,
  Post,
  Required,
  Auth,
  Get,
  Put,
  ValidObjectId
} from '../decorator/router'
import mongoose from 'mongoose'
import omit from 'lodash/omit'
// import ApiError from '../lib/ApiError'
const ips = []
const PostSchema = mongoose.model('Post')

@Controller('/api/v0/post')
class AdminRouter {
  @Get('/list')
  async getPosts (ctx, next) {
    const data = await PostSchema.find()
    ctx.body = {
      success: true,
      data: data.filter((d) => {
        return !d.deleted
      }).map((d) => {
        delete d.deleted
        return d
      })
    }
  }

  @Get(':pid')
  @ValidObjectId('pid')
  async getPost (ctx, next) {
    const { pid } = ctx.params
    const data = await PostSchema.findOne({_id: pid})
    if (!~ips.indexOf(ctx.request.ip)) {
      ips.push(ctx.request.ip)
      data.count++
      await data.save()
      setTimeout(() => {
        ips.splice(ips.indexOf(ctx.request.ip), 1)
      }, 1000 * 60 * 60 * 24)
    }
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

  @Put('/update')
  @Auth(['admin', 'superAdmin'])
  @ValidObjectId('pid')
  @Required({
    body: ['pid']
  })
  async updatePost (ctx, next) {
    const body = ctx.request.body
    const post = await PostSchema.findOne({
      _id: body.pid
    }).exec()
    Object.assign(post, omit(body, ['pid']))
    post.save()

    return (ctx.body = {
      code: 200
    })
  }

  @Delete(':pid')
  @Auth(['admin', 'superAdmin'])
  async deletePost (ctx, next) {
    const { pid } = ctx.params
    await PostSchema.update({
      _id: pid
    }, {
      deleted: true
    })

    return (ctx.body = {
      code: 200
    })
  }
}

export default AdminRouter
