import { defineEventHandler } from 'h3'
import { connectToDB } from '~/server/utils/mongoose'
import { Reaction } from '~/server/models/academy/reaction.schema'
import { Activity } from '~/server/models/academy/activity.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'

export default defineEventHandler(async (event) => {
  await connectToDB()
  const user = await getUserFromSession(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  const body = await readBody(event)
  const { tutorialId, type } = body
  if (!tutorialId || !['like','love'].includes(type)) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres invalides' })
  }

  // toggle
  const existing = await Reaction.findOne({ userId: user._id, tutorialId, type })
  if (existing) {
    await Reaction.deleteOne({ _id: existing._id })
    return { success: true, toggled: 'off' }
  }

  await Reaction.create({ userId: user._id, tutorialId, type })
  await Activity.create({ userId: user._id, tutorialId, type: type === 'like' ? 'like' : 'love' })
  return { success: true, toggled: 'on' }
})


