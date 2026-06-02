import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  throw new Error('数据库链接未设置')
}

const cache: {
  connection: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
} = { connection: null, promise: null }

export default async function DBconnect() {
  if (cache.connection) {
    return cache.connection
  }
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI!)
  }
  try {
    cache.connection = await cache.promise
    return cache.connection
  } catch (error) {
    console.error('数据库连接失败', error)
    throw error
  }
}

