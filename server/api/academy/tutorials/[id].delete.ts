import { defineEventHandler, createError } from 'h3'
import { getRouterParam } from 'h3'
import mongoose from 'mongoose'
import { connectToDB } from '~/server/utils/mongoose'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities'
import { Tutorial } from '~/server/models/academy/tutorial.schema'

export default defineEventHandler(async (event) => {
  await connectToDB()

  const id = getRouterParam(event, 'id')
  if (!id || !mongoose.isValidObjectId(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  const user = await getUserFromSession(event)
  const ability = await defineAbilitiesForUser(user as any)
  if (!ability.can('delete', 'Tutorial') && !ability.can('manage', 'all')) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  const deleted = await Tutorial.findByIdAndDelete(id)
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Tutoriel introuvable' })
  }
  return { success: true }
})


