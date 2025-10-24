import { defineEventHandler } from 'h3'
import { connectToDB } from '~/server/utils/mongoose'
import { Activity } from '~/server/models/academy/activity.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities'

export default defineEventHandler(async (event) => {
  await connectToDB()
  const user = await getUserFromSession(event)
  const ability = await defineAbilitiesForUser(user)
  const canDelete = ability?.can('manage','all') || ability?.can('delete','TutorialTracking')
  if (!canDelete) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }
  const body = await readBody(event)
  const ids: string[] = Array.isArray(body?.ids) ? body.ids : []
  if (!ids.length) return { success: true, deleted: 0 }
  const res = await Activity.deleteMany({ _id: { $in: ids } })
  return { success: true, deleted: res.deletedCount || 0 }
})


