import { connectToDB } from '~/server/utils/mongoose'
import { Transaction } from '~/server/models/transaction/transaction.schema'

export default defineEventHandler(async (event) => {
  await connectToDB()

  const { year } = getQuery(event)

  const y = Number(year ?? new Date().getFullYear())
  const start = new Date(y, 0, 1)
  const end = new Date(y + 1, 0, 1)

  const pipeline: Record<string, unknown>[] = [
    { $match: { createdAt: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, type: '$type' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.month': 1 } }
  ]

  const stats = await Transaction.aggregate(pipeline)

  return { data: stats }
})

