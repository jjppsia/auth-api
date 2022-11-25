export default {
  port: process.env.PORT || 5000,
  dbURI: process.env.MONGO_URI,
  logLevel: 'info',
  accessTokenPrivateKey: '',
  refreshTokenPrivateKey: '',
  smtp: {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
  },
}
