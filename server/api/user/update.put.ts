import { connectToDB } from '~/server/utils/mongoose'
import { User } from '~/server/models/user/user.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'

export default defineEventHandler(async (event) => {
  await connectToDB()
  const user = await getUserFromSession(event)
  const body = await readBody(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  }

  const updated = await User.findByIdAndUpdate(user._id, {
    nom: body.nom,
    prenom: body.prenom,
    avatar: body.avatar,
    metier: body.metier,
  }, { new: true }).select('-password')

  return updated
})