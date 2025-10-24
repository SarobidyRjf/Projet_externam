import { connectToDB } from '~/server/utils/mongoose'
import { User } from '~/server/models/user/user.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
export default defineEventHandler(async (event) => {
    await connectToDB()

    const user = await getUserFromSession(event)
    const ability = await defineAbilitiesForUser(user);

  // Vérifie la permission
  // if (!ability.can('read', 'User')) {
  //   throw createError({ statusCode: 403, statusMessage:"Vous n'avez pas la permission de faire cette action" });
  // }

    const leads = await User.find({ metier: 'commercial' }).sort({ createdAt: -1 })
    return leads
})