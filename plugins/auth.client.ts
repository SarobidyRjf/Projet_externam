// plugins/auth.client.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  const auth = useAuthStore()
  if (!auth.userConnected) {
    await auth.getUserConnected()
  }
})
