import { User } from '~/server/models/user/user.schema'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email et mot de passe requis' })
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Utilisateur non trouvé' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw createError({ statusCode: 401, statusMessage: 'Mot de passe incorrect' })
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    useRuntimeConfig().jwtSecret,
    { expiresIn: '2h' }
  )

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role
    }
  }
})
