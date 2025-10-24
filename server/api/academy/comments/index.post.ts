import { defineEventHandler } from 'h3'
import { connectToDB } from '~/server/utils/mongoose'
import { Comment } from '~/server/models/academy/comment.schema'
import { Activity } from '~/server/models/academy/activity.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'

export default defineEventHandler(async (event) => {
  await connectToDB()
  const user = await getUserFromSession(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  const body = await readBody(event)
  const { tutorialId, content } = body
  if (!tutorialId || !content || !String(content).trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres invalides' })
  }

  const row = await Comment.create({ userId: user._id, tutorialId, content: String(content).trim() })
  await Activity.create({ userId: user._id, tutorialId, type: 'comment', content: row.content })
  return { success: true, data: row }
})


