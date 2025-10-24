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

  // 👉 Optionnel : autoriser uniquement les admins
  // if (user.metier !== 'admin') {
  //   throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  // }

  const method = event.node.req.method

  // GET : récupérer tous les utilisateurs
  if (method === 'GET') {
    const users = await User.find()
      .select('-password')
      .populate('role', 'name')
      .sort({ createdAt: -1 })
    return users
  }

  // POST : créer un nouvel utilisateur
  if (method === 'POST') {
    const body = await readBody(event)
    const { email, nom, prenom, matricule, metier, password, role } = body as any

    if (!email || !password || !matricule) {
      throw createError({ statusCode: 400, statusMessage: 'Email, mot de passe et matricule requis' })
    }

    // Vérifier doublons
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
  }

  // PUT : modifier un utilisateur
  if (method === 'PUT') {
    const body = await readBody(event)
    const { userId, ...updateData } = body

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password')

    if (!updatedUser) {
      throw createError({ statusCode: 404, statusMessage: 'Utilisateur non trouvé' })
    }

    return updatedUser
  }

  // DELETE : supprimer un utilisateur
  if (method === 'DELETE') {
    const body = await readBody(event)
    const { userId } = body

    const deletedUser = await User.findByIdAndDelete(userId)
    if (!deletedUser) {
      throw createError({ statusCode: 404, statusMessage: 'Utilisateur non trouvé' })
    }

    return { message: 'Utilisateur supprimé avec succès' }
  }

  // Méthode non autorisée
  throw createError({ statusCode: 405, statusMessage: 'Méthode non autorisée' })
})