import { connectToDB } from '~/server/utils/mongoose'
import { getRouterParam } from 'h3'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities'
import { Role } from '~/server/models/role/role.schema'
import { validatePermissionsPayload } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  await connectToDB()

  const user = await getUserFromSession(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  }

  const ability = await defineAbilitiesForUser(user)
  if (!ability.can('update', 'Role') && !ability.can('manage', 'all')) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { name, permissions } = body

  const perms = Array.isArray(permissions) ? permissions : []
  const validationError = validatePermissionsPayload(perms)
  if (validationError) {
    throw createError({ statusCode: 400, statusMessage: validationError })
  }

  const updated = await Role.findByIdAndUpdate(id, { name, permissions: perms }, { new: true })
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Rôle introuvable' })
  }

  return updated
})


