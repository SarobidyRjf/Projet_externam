import { connectToDB } from '~/server/utils/mongoose'
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
  if (!ability.can('create', 'Role') && !ability.can('manage', 'all')) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  const body = await readBody(event)
  const { name, permissions } = body

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Le nom du rôle est requis' })
  }

  const existing = await Role.findOne({ name })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Ce rôle existe déjà' })
  }

  const perms = Array.isArray(permissions) ? permissions : []
  const validationError = validatePermissionsPayload(perms)
  if (validationError) {
    throw createError({ statusCode: 400, statusMessage: validationError })
  }

  const role = await Role.create({ name, permissions: perms })
  return role
})


