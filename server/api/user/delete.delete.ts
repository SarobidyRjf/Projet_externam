import { connectToDB } from '~/server/utils/mongoose'
import { User } from '~/server/models/user/user.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'

export default defineEventHandler(async (event) => {
  await connectToDB()
  const user = await getUserFromSession(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  }

  await User.findByIdAndDelete(user._id)
  return { message: 'Profil supprimé avec succès' }
})
