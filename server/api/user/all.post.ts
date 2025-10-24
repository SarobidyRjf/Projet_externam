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
  const { email, nom, prenom, matricule, metier, password, role } = body as any

  if (!email || !password || !matricule) {
    throw createError({ statusCode: 400, statusMessage: 'Email, mot de passe et matricule requis' })
  }

  const existsEmail = await User.findOne({ email })
  if (existsEmail) {
    throw createError({ statusCode: 409, statusMessage: 'Un utilisateur avec cet email existe déjà' })
  }
  const existsMat = await User.findOne({ matricule })
  if (existsMat) {
    throw createError({ statusCode: 409, statusMessage: 'Ce matricule est déjà utilisé' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = new User({
    email,
    nom,
    prenom,
    matricule,
    metier,
    role: role || null,
    password: hashedPassword
  })

  await newUser.save()
  return { message: 'Utilisateur créé avec succès' }
})


