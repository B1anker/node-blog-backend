import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Postchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  subTitle: {
    type: String,
    default: ''
  },
  catagory: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  summary: {
    type: String,
    default: ''
  },
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

Postchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }
  next()
})

mongoose.model('Post', Postchema)
