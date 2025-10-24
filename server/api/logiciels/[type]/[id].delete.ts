import { defineEventHandler, createError } from 'h3'
import { connectToDB } from '~/server/utils/mongoose'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities'
import { resolveSoftwareModel, type SoftwareCategory } from '~/server/models/software/software.schema'

export default defineEventHandler(async (event) => {
  await connectToDB()

  const user = await getUserFromSession(event)
  const ability = await defineAbilitiesForUser(user)
  const canDelete =
    ability?.can('manage', 'LeadMeta') ||
    ability?.can('delete', 'LeadMeta') ||
    ability?.can('update', 'LeadMeta')

  if (!canDelete) {
    throw createError({ statusCode: 403, statusMessage: "Vous n'avez pas la permission de faire cette action" })
  }

  const params = event.context.params || {}
  const typeParam = params.type as SoftwareCategory | undefined
  const id = params.id
  const Model = resolveSoftwareModel(typeParam)

  if (!Model || !typeParam || !id) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres invalides' })
  }

  const deleted = await Model.findByIdAndDelete(id)

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Logiciel non trouvé' })
  }

  return {
    message: 'Logiciel supprimé avec succès'
  }
})
