import 'dotenv/config'
import config from 'config'
import express from 'express'
import deserializeUser from './middlewares/deserializeUser'
import router from './routes'
import connectDb from './utils/connectDb'
import log from './utils/logger'

const app = express()

app.use(express.json())

app.use(deserializeUser)
app.use(router)

const port = config.get('port')

app.listen(port, () => {
  log.info(`Server running at http://localhost:${port}`)

  connectDb()
})
