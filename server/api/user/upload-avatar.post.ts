import { readMultipartFormData } from 'h3'
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

  const form = await readMultipartFormData(event)
  const file = form?.find(f => f.name === 'avatar')
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Aucun fichier fourni' })
  }

  // Chemin de stockage (ex: /public/uploads/avatars)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  // Nom du fichier unique
  const fileName = `${user._id}-${Date.now()}-${file.filename}`
  const filePath = path.join(uploadDir, fileName)

  // Écriture du fichier sur le disque
  fs.writeFileSync(filePath, file.data)

  // Génération de l’URL publique (ex: /uploads/avatars/xxx.png)
  const fileUrl = `/uploads/avatars/${fileName}`

  // Mise à jour de l’utilisateur
  await User.findByIdAndUpdate(user._id, { avatar: fileUrl }, { new: true })

  return { message: 'Avatar mis à jour', avatar: fileUrl }
})
