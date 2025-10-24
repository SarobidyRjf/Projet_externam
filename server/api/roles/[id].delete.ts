import { connectToDB } from '~/server/utils/mongoose'
import { getRouterParam } from 'h3'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities'
import { Role } from '~/server/models/role/role.schema'

export default defineEventHandler(async (event) => {
  await connectToDB()

  const user = await getUserFromSession(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  }

  const ability = await defineAbilitiesForUser(user)
  if (!ability.can('delete', 'Role') && !ability.can('manage', 'all')) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  const id = getRouterParam(event, 'id')
  const deleted = await Role.findByIdAndDelete(id)
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Rôle introuvable' })
  }
  return { message: 'Rôle supprimé' }
})


