import { connectToDB } from '~/server/utils/mongoose'
import { User } from '~/server/models/user/user.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'

export default defineEventHandler(async (event) => {
  await connectToDB()
  const user = await getUserFromSession(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  }

  const body = await readBody(event)
  const { userId } = body as any

  const deletedUser = await User.findByIdAndDelete(userId)
  if (!deletedUser) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur non trouvé' })
  }
  return { message: 'Utilisateur supprimé avec succès' }
})


