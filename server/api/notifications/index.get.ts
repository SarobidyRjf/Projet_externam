import { connectToDB } from '~/server/utils/mongoose'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { Notification } from '~/server/models/notification/notification.schema'

export default defineEventHandler(async (event) => {
  await connectToDB()
  const user = await getUserFromSession(event)

  const notifications = await Notification.find({ user: user._id })
    .sort({ createdAt: -1 })
    .lean()

  return notifications
})
