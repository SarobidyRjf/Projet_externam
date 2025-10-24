import { defineEventHandler, getHeader, createError } from 'h3';
import { verifyToken } from '~/server/utils/verifyToken';


//mvp : no token dans le cookie, sous forme
export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Token manquant' });
  }

  try {
    verifyToken(token);
    return { message: 'Déconnexion réussie' };
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: 'Token invalide' });
  }
});
