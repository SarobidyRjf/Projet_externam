import { connectToDB } from '~/server/utils/mongoose'
import { User } from '~/server/models/user/user.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  await connectToDB()
  const user = await getUserFromSession(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  }

  const body = await readBody(event)
  const { userId, ...updateData } = body as any

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10)
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password')
  if (!updatedUser) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur non trouvé' })
  }
  return updatedUser
})


