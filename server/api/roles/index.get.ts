import { connectToDB } from '~/server/utils/mongoose'
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
  if (!ability.can('read', 'Role') && !ability.can('manage', 'all')) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  const roles = await Role.find().lean()
  return roles
})


