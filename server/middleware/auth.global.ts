// server/middleware/auth.global.ts
import { defineEventHandler, getHeader, createError } from 'h3'
import { verifyToken } from '~/server/utils/verifyToken'

export default defineEventHandler(async (event) => {
  // Tu peux choisir de ne PAS protéger certaines routes (ex: login, public)

  // Exemple : Ignorer les routes publiques
  const publicRoutes = ['/api/auth/login', '/' ]
  if (publicRoutes.some(route => event.path.startsWith(route))) {
    return // skip middleware, pas d’auth requis
  }

  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.split(' ')[1]

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Token manquant' })
  }

  const user = verifyToken(token)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Token invalide' })
  }

  event.context.auth = user // attache user au contexte
})
