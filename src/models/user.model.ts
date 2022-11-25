import {
  DocumentType,
  getModelForClass,
  index,
  modelOptions,
  pre,
  prop,
  Severity,
} from '@typegoose/typegoose'
import argon2 from 'argon2'
import { v4 as uuidv4 } from 'uuid'
import log from '../utils/logger'

export const privateFields = [
  'password',
  'verificationCode',
  'passwordResetCode',
  'verified',
  '__v',
]

@pre<User>('save', async function () {
  if (!this.isModified('password')) {
    return
  }

  const hash = await argon2.hash(this.password)

  this.password = hash

  return
})
@index({ email: 1 })
@modelOptions({
  schemaOptions: { timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class User {
  @prop({ required: true })
  firstName: string

  @prop({ required: true })
  lastName: string

  @prop({ lowercase: true, required: true, unique: true })
  email: string

  @prop({ required: true })
  password: string

  @prop({ required: true, default: () => uuidv4() })
  verificationCode: string

  @prop()
  passwordResetCode: string | null

  @prop({ default: false })
  verified: boolean

  async validatePassword(this: DocumentType<User>, candidatePassword: string) {
    try {
      return await argon2.verify(this.password, candidatePassword)
    } catch (error) {
      log.error(error, 'Error validating password')
      return false
    }
  }
}

const UserModel = getModelForClass(User)

export default UserModel
