import { defineEventHandler } from 'h3'
import { connectToDB } from '~/server/utils/mongoose'
import { getQuery } from 'h3'
import { Comment } from '~/server/models/academy/comment.schema'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  await connectToDB()
  const tutorialId = (getQuery(event).tutorialId as string) || ''
  if (!tutorialId) return { success: true, data: [] }
  const rows = await Comment.find({ tutorialId: new mongoose.Types.ObjectId(tutorialId) })
    .populate('userId', { email: 1, nom: 1, prenom: 1 })
    .sort({ createdAt: -1 })

  const data = rows.map((r: any) => {
    const user = r.userId as any
    const userEmail = user?.email || ''
    const userName = [user?.prenom, user?.nom].filter(Boolean).join(' ').trim()
    return {
      _id: r._id,
      tutorialId: r.tutorialId,
      userId: user?._id || r.userId,
      content: r.content,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      userEmail,
      userName,
    }
  })
  return { success: true, data }
})


