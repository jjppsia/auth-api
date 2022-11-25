import config from 'config'
import mongoose from 'mongoose'
import log from './logger'

async function connectDb() {
  const dbURI = config.get<string>('dbURI')

  try {
    await mongoose.connect(dbURI)
    log.info(`Connected to MongoDB`)
  } catch (error: any) {
    log.error(`Error connecting to MongoDB: ${error.message}`)
    process.exit(1)
  }
}

export default connectDb
