import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const SALT_WORK_FACTOR = 10
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_TIME = 2 * 60 * 60 * 1000
const Schema = mongoose.Schema

const UserSchema = new Schema({
  // user admin superAdmin
  role: {
    type: String,
    default: 'user'
  },
  username: String,
  email: String,
  password: String,
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: {
    type: Number,
    default: 0
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

UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

UserSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }
  next()
})

UserSchema.pre('save', async function (next) {
  let user = this
  if (!user.isModified('password')) {
    return next()
  }
  user.password = await encrypt(user.password)
  next()
})

UserSchema.methods = {
  comparePassword (_password, password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_password, password, function (err, isMatch) {
        if (!err) resolve(isMatch)
        else reject(err)
      })
    })
  },

  async changeUserInfo (params) {
    const self = this
    if (params.password) {
      params.password = await encrypt(params.password)
    }
    return new Promise((resolve, reject) => {
      self.update({
        $set: params
      }, (err) => {
        if (!err) resolve(true)
        else reject(err)
      })
    })
  },

  incLoginAttempts (user) {
    const self = this

    return new Promise((resolve, reject) => {
      if (self.lockUntil && self.lockUntil < Date.now()) {
        self.update({
          $set: {
            loginAttempts: 1
          },
          $unset: {
            lockUntil: 1
          }
        }, function (err) {
          if (!err) resolve(true)
          else reject(err)
        })
      } else {
        let updates = {
          $inc: {
            loginAttempts: 1
          }
        }

        if (self.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !self.isLocked) {
          updates.$set = {
            lockUntil: Date.now() + LOCK_TIME
          }
        }

        self.update(updates, err => {
          if (!err) resolve(true)
          else reject(err)
        })
      }
    })
  }
}

async function encrypt (password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) return reject(err)
      bcrypt.hash(password, salt, (error, hash) => {
        if (error) return reject(error)
        resolve(hash)
      })
    })
  })
}

mongoose.model('User', UserSchema)
