import { connectToDB } from '~/server/utils/mongoose'
import { User } from '~/server/models/user/user.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'

export default defineEventHandler(async (event) => {
  await connectToDB()
  const user = await getUserFromSession(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  }

  const profile = await User.findById(user._id).select('-password')
  if (!profile) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
  }

  return profile
})