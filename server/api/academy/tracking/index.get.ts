import { defineEventHandler } from 'h3'
import { connectToDB } from '~/server/utils/mongoose'
import { getQuery } from 'h3'
import { Activity } from '~/server/models/academy/activity.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities'

export default defineEventHandler(async (event) => {
  await connectToDB()

  const user = await getUserFromSession(event)
  const ability = await defineAbilitiesForUser(user)
  const canRead = ability?.can('manage','all') || ability?.can('read','TutorialTracking')
  if (!canRead) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  const q = (getQuery(event).q as string)?.trim()
  const pipeline: any[] = [
    { $sort: { createdAt: -1 } },
    { $limit: 500 },
    { $lookup: { from: 'tutorials', localField: 'tutorialId', foreignField: '_id', as: 't' } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'u' } },
    { $addFields: {
        tutorialTitle: { $arrayElemAt: ['$t.title', 0] },
        tutorialType: { $arrayElemAt: ['$t.type', 0] },
        userEmail: { $arrayElemAt: ['$u.email', 0] },
        userName: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: [{ $arrayElemAt: ['$u.prenom', 0] }, ''] },
                ' ',
                { $ifNull: [{ $arrayElemAt: ['$u.nom', 0] }, ''] },
              ]
            }
          }
        }
      }
    },
    { $project: { t: 0, u: 0 } }
  ]

  const rows = await Activity.aggregate(pipeline)

  const filtered = q
    ? rows.filter((r: any) =>
        (r.tutorialTitle || '').toLowerCase().includes(q.toLowerCase()) ||
        (r.userEmail || '').toLowerCase().includes(q.toLowerCase()) ||
        (r.userName || '').toLowerCase().includes(q.toLowerCase()) ||
        (r.type || '').toLowerCase().includes(q.toLowerCase())
      )
    : rows

  return { success: true, data: filtered }
})


