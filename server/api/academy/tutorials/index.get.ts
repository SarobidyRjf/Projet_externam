import { defineEventHandler } from 'h3'
import { connectToDB } from '~/server/utils/mongoose'
import { getQuery } from 'h3'
import { Tutorial } from '~/server/models/academy/tutorial.schema'

export default defineEventHandler(async (event) => {
  await connectToDB()
  const query = getQuery(event)
  const onlyPublished = query.published === 'true'
  const search = (query.q as string)?.trim()
  const type = (query.type as string)?.trim()

  const conditions: any = {}
  if (onlyPublished) conditions.published = true
  if (type === 'video' || type === 'pdf') conditions.type = type
  if (search) conditions.title = { $regex: search, $options: 'i' }

  const items = await Tutorial.find(conditions).sort({ createdAt: -1 })
  return { success: true, data: items }
})


