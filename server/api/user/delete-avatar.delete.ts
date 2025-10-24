import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { User } from '~/server/models/user/user.schema'
import { connectToDB } from '~/server/utils/mongoose'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  await connectToDB()

  const user = await getUserFromSession(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  // Récupérer l'utilisateur complet
  const currentUser = await User.findById(user._id)
  if (!currentUser) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur non trouvé' })
  }

  // Supprimer l'ancien fichier si présent
  if (currentUser.avatar && currentUser.avatar.startsWith('/uploads/avatars/')) {
    const filePath = path.join(process.cwd(), 'public', currentUser.avatar)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }

  // Mettre à jour l'utilisateur (avatar vide)
  currentUser.avatar = ''
  await currentUser.save()

  return { message: 'Avatar supprimé avec succès', avatar: '' }
})
