import { connectToDB } from '~/server/utils/mongoose'
import { User } from '~/server/models/user/user.schema'
import bcrypt from 'bcrypt'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities'

export default defineEventHandler(async (event) => {
  await connectToDB()

  const currentUser = await getUserFromSession(event)
  const ability = await defineAbilitiesForUser(currentUser)

  // Vérifie les permissions si nécessaire
  // if (!ability.can('create', 'User')) {
  //   throw createError({ statusCode: 403, statusMessage: "Accès refusé" })
  // }

  const body = await readBody(event)

  // --- Validation minimale des données reçues ---
  const { email, password, matricule, nom, prenom, role, metier } = body

  if (!email || !password || !matricule || !nom || !prenom) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Champs requis manquants (email, password, matricule, nom, prenom)',
    })
  }

  // Vérifie si l'email existe déjà
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Un utilisateur avec cet email existe déjà',
    })
  }

  // Vérifie si le matricule existe déjà
  const existingMatricule = await User.findOne({ matricule })
  if (existingMatricule) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Ce matricule est déjà utilisé',
    })
  }

  // Hachage du mot de passe avant sauvegarde
  const hashedPassword = await bcrypt.hash(password, 10)

  // --- Création de l'utilisateur ---
  const newUser = new User({
    email,
    password: hashedPassword,
    matricule,
    nom,
    prenom,
    role: role || null,
    metier: metier || 'user',
  })

  await newUser.save()

  return {
    message: 'Utilisateur créé avec succès',
    user: {
      _id: newUser._id,
      email: newUser.email,
      matricule: newUser.matricule,
      nom: newUser.nom,
      prenom: newUser.prenom,
      role: newUser.role,
      metier: newUser.metier,
      createdAt: newUser.createdAt,
    },
  }
})
