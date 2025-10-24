import { connectToDB } from '~/server/utils/mongoose'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities'
import { User } from '~/server/models/user/user.schema'

export default defineEventHandler( async (event) => {
  await connectToDB()

  const currentUser = await getUserFromSession(event)
  if (!currentUser) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  }

  const ability = await defineAbilitiesForUser(currentUser)
  if (!ability.can('update', 'User') && !ability.can('manage', 'all')) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  const body = await readBody(event)
  const { userId, roleId } = body

  if (!userId || !roleId) {
    throw createError({ statusCode: 400, statusMessage: 'userId et roleId requis' })
  }

  const updated = await User.findByIdAndUpdate(userId, { role: roleId }, { new: true }).select('-password')
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
  }

  return updated
})


