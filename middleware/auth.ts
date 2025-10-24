// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // N'exécuter que côté client
  if (process.client) return

    const token = useCookie('token');

  if (!token.value) {
    return navigateTo('/login')
  }

  try {
    const payload = JSON.parse(atob(token.value.split('.')[1])) // décodage du JWT

    const exp = payload.exp
    const now = Math.floor(Date.now() / 1000)

    if (exp < now) {
      // Token expiré
      token.value = null
      return navigateTo('/login')
    }
  } catch (error) {
    // Token invalide
    token.value = null
    return navigateTo('/login')
  }
})
