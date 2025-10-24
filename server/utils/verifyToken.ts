import jwt from 'jsonwebtoken'

export function verifyToken(token: string) {
  const secret = useRuntimeConfig().jwtSecret
  try {
    return jwt.verify(token, secret)
  } catch {
    return null
  }
}