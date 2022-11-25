import { Request, Response } from 'express'
import { get } from 'lodash'
import { CreateSessionInput } from '../schemas/auth.schema'
import {
  findSessionById,
  signAccessToken,
  signRefreshToken,
} from '../services/auth.service'
import { findUserByEmail, findUserById } from '../services/user.service'
import { verifyJwt } from '../utils/jwt'

export async function createSessionHandler(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
) {
  const { email, password } = req.body

  try {
    const user = await findUserByEmail(email)

    if (!user) {
      return res.status(401).send('Invalid email or password')
    }

    if (!user.verified) {
      return res.status(401).send('Please verify your account')
    }

    const isValidPassword = await user.validatePassword(password)

    if (!isValidPassword) {
      return res.status(401).send('Invalid email or password')
    }

    const accessToken = signAccessToken(user)
    const refreshToken = await signRefreshToken({ userId: user._id })

    return res.status(200).send({ accessToken, refreshToken })
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  const refreshToken: any = get(req, 'headers.x-refresh')

  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    'refreshTokenPublicKey'
  )

  if (!decoded) {
    return res.status(401).send('Unable to refresh access token')
  }

  const session = await findSessionById(decoded.session)

  if (!session || !session.valid) {
    return res.status(401).send('Unable to refresh access token')
  }

  const user = await findUserById(String(session.user))

  if (!user) {
    return res.status(401).send('Unable to refresh access token')
  }

  const accessToken = signAccessToken(user)

  return res.status(200).send({ accessToken })
}
