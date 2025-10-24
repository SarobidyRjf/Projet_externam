import { defineEventHandler, getQuery, createError } from 'h3'
import { connectToDB } from '~/server/utils/mongoose'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities'
import { resolveSoftwareModel, type SoftwareCategory } from '~/server/models/software/software.schema'

const DEFAULT_LIMIT = 25

export default defineEventHandler(async (event) => {
  await connectToDB()

  const user = await getUserFromSession(event)
  const ability = await defineAbilitiesForUser(user)
  const canRead =
    ability?.can('manage', 'LeadMeta') || ability?.can('read', 'LeadMeta')

  if (!canRead) {
    throw createError({ statusCode: 403, statusMessage: "Vous n'avez pas la permission de faire cette action" })
  }

  const params = event.context.params || {}
  const typeParam = params.type as SoftwareCategory | undefined
  const Model = resolveSoftwareModel(typeParam)

  if (!Model || !typeParam) {
    throw createError({ statusCode: 400, statusMessage: 'Type de logiciel inconnu' })
  }

  const query = getQuery(event)
  const page = Math.max(parseInt((query.page as string) || '1', 10), 1)
  const limit = Math.max(parseInt((query.limit as string) || `${DEFAULT_LIMIT}`, 10), 1)
  const skip = (page - 1) * limit
  const search = typeof query.search === 'string' ? query.search.trim() : ''

  const filters: Record<string, any> = {}

  if (search) {
    filters.label = { $regex: search, $options: 'i' }
  }

  const [items, total] = await Promise.all([
    Model.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Model.countDocuments(filters)
  ])

  return {
    data: items,
    total,
    page,
    limit
  }
})
