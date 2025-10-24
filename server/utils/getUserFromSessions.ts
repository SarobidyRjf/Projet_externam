import { User } from '~/server/models/user/user.schema'
import { verifyToken } from '~/server/utils/verifyToken'
import { getCookie, getHeader, parseCookies } from 'h3'
import { createError } from 'h3'

export async function getUserFromSession(event: any) {
  const token = getCookie(event, 'token') ||
                getHeader(event, 'authorization')?.replace('Bearer ', '') ||
                parseCookies(event).token

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    const payload = verifyToken(token) as any
    const user = await User.findById(payload?.id).populate('role') // si tu as ref role
    if (!user) throw createError({ statusCode: 401, statusMessage: 'User not found' })
    return user
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }
}
