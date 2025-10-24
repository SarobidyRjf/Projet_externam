import { connectToDB } from '~/server/utils/mongoose'
import { Transaction } from '~/server/models/transaction/transaction.schema'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  await connectToDB()

  const body = await readBody(event)
  if (!body.lead || !body.type) {
    throw createError({ statusCode: 400, statusMessage: 'lead and type are required' })
  }

  const transaction = await Transaction.create({
    lead: new mongoose.Types.ObjectId(body.lead),
    type: body.type,
    ...(body.date ? { createdAt: new Date(body.date) } : {})
  })

  return { data: transaction }
})

