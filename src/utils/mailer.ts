import nodemailer, { SendMailOptions } from 'nodemailer'
import config from 'config'
import log from './logger'

type Smtp = {
  host: string
  port: number
  secure: boolean
}

const smtp = config.get<Smtp>('smtp')

const sendEmail = async (payload: SendMailOptions) => {
  const testAcount = await nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: testAcount.user,
      pass: testAcount.pass,
    },
  })

  transporter.sendMail(payload, (error, info) => {
    if (error) {
      log.error(error)

      return
    }

    log.info(`Message sent: ${info.messageId}`)
    log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
  })
}

export default sendEmail
