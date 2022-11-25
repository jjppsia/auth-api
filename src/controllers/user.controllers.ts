import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import {
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyUserInput,
} from '../schemas/user.schema'
import {
  createUser,
  findUserByEmail,
  findUserById,
} from '../services/user.service'
import sendEmail from '../utils/mailer'

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  const body = req.body

  try {
    const user = await createUser(body)

    await sendEmail({
      from: 'test@example.com',
      to: user.email,
      subject: 'Please verify your account',
      text: `Verification code: ${user.verificationCode}
             Id: ${user._id}`,
    })

    return res.status(201).send('User successfully created')
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).send('User already exists')
    }

    return res.status(500).send(error.message)
  }
}

export async function verifyUserHandler(
  req: Request<VerifyUserInput>,
  res: Response
) {
  const { id, verificationCode } = req.params

  try {
    const user = await findUserById(id)

    if (!user) {
      return res.status(404).send('User not found')
    }

    if (user.verified) {
      return res.status(400).send('User already verified')
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).send('Unable to verify user')
    }

    user.verified = true

    await user.save()

    return res.status(200).send('User successfully verified')
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

export async function forgotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response
) {
  const { email } = req.body
  const message =
    'If the email address you entered is associated with an account, you will receive an email with a link to reset your password.'

  try {
    const user = await findUserByEmail(email)

    if (!user) {
      return res.status(404).send('User not found')
    }

    if (!user.verified) {
      return res.status(400).send('User not verified')
    }

    const passwordResetCode = uuidv4()

    user.passwordResetCode = passwordResetCode

    await user.save()

    await sendEmail({
      from: 'test@example.com',
      to: user.email,
      subject: 'Reset your password',
      text: `Password reset code: ${passwordResetCode}
             Id: ${user._id}`,
    })

    return res.status(200).send(message)
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

export async function resetPasswordHandler(
  req: Request<ResetPasswordInput['params'], {}, ResetPasswordInput['body']>,
  res: Response
) {
  const { id, passwordResetCode } = req.params
  const { password } = req.body

  try {
    const user = await findUserById(id)

    if (
      !user ||
      !user.passwordResetCode ||
      user.passwordResetCode !== passwordResetCode
    ) {
      return res.status(400).send('Unable to reset password')
    }

    user.passwordResetCode = null
    user.password = password

    await user.save()

    return res.status(200).send('Successfully updated password')
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

export async function getCurrentUserHandler(req: Request, res: Response) {
  return res.status(200).send(res.locals.user)
}
