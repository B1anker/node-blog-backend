import mongoose from 'mongoose'
import ApiError from '../lib/ApiError'

const User = mongoose.model('User')
const roleTypes = ['user', 'admin', 'superAdmin']

async function getUserInfo (username) {
  const user = await User.findOne({ username }).exec()
  return user
}

async function checkPassword (username, password) {
  let match = false

  const user = await User.findOne({ username }).exec()

  if (user) {
    match = await user.comparePassword(password, user.password)
  } else {
    throw new ApiError('USER_NOT_LOGIN', true)
  }

  return {
    match,
    user
  }
}

async function changeUserInfo (params, username, role) {
  const user = await User.findOne({ username: username }).exec()
  if (!user) {
    throw new ApiError('USER_NOT_EXIST', true)
  }
  if (user.role === 'admin' && role === 'superAdmin') {
    throw new ApiError('PERMISSION_DENIED', true)
  }
  try {
    await user.changeUserInfo(params)
  } catch (err) {
    throw new ApiError('DATABASE_ERROR', true)
  }
  return user
}

async function changeRole (type, username) {
  const user = await User.findOne({ username: username }).exec()
  if (!user) {
    throw new ApiError('USER_NOT_EXIST', true)
  }
  if (~roleTypes.indexOf(type)) {
    try {
      await user.changeRole(type)
    } catch (err) {
      throw new ApiError('DATABASE_ERROR', true)
    }
  } else {
    throw new ApiError('UNKNOW_ROLE_TYPE', true)
  }
  return user
}

export {
  getUserInfo,
  checkPassword,
  changeUserInfo,
  changeRole
}
