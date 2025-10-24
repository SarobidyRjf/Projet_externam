import { defineStore } from 'pinia'

type Permission = { action: string; subject: string; conditions?: Record<string, any> | null }
type Role = { _id: string; name: string; permissions: Permission[] }

export const useRolesStore = defineStore('roles', {
  state: () => ({
    roles: [] as Role[],
    loading: false as boolean,
    error: '' as string | null,
  }),
  actions: {
    async fetchRoles() {
      this.loading = true
      this.error = null
      try {
        const res = await $fetch<Role[]>('/api/roles')
        this.roles = res
      } catch (e: any) {
        this.error = e?.data?.statusMessage || e?.message || 'Erreur de chargement des rôles'
      } finally {
        this.loading = false
      }
    },
    async createRole(payload: { name: string; permissions: Permission[] }) {
      const created = await $fetch<Role>('/api/roles', { method: 'POST', body: payload })
      this.roles.unshift(created)
      return created
    },
    async updateRole(id: string, payload: { name: string; permissions: Permission[] }) {
      const updated = await $fetch<Role>(`/api/roles/${id}`, { method: 'PUT', body: payload })
      const idx = this.roles.findIndex(r => r._id === id)
      if (idx !== -1) this.roles[idx] = updated
      return updated
    },
    async deleteRole(id: string) {
      await $fetch(`/api/roles/${id}`, { method: 'DELETE' })
      this.roles = this.roles.filter(r => r._id !== id)
    },
    async assignUserRole(userId: string, roleId: string) {
      return await $fetch(`/api/user/assign-role`, { method: 'PUT', body: { userId, roleId } })
    },
  },
})


