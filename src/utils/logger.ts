import config from 'config'
import dayjs from 'dayjs'
import logger from 'pino'

const level = config.get<string>('logLevel')

const log = logger({
  level,
  transport: { target: 'pino-pretty' },
  base: { pid: false },
  timestamp: () => `,"time":"${dayjs().format()}"`,
})

export default log