import { connectToDB } from '~/server/utils/mongoose'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { Notification } from '~/server/models/notification/notification.schema'

export default defineEventHandler(async (event) => {
  await connectToDB()
  const user = await getUserFromSession(event)
  const { id } = event.context.params

  await Notification.updateOne({ _id: id, user: user._id }, { $set: { read: true } })

  return { success: true }
})
