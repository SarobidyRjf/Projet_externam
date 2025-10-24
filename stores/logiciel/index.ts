import { defineStore } from 'pinia'

export type SoftwareTabKey = 'logiciel' | 'logicielIA' | 'voixIA'

export type SoftwareField = {
  key: string
  value: string
}

export interface SoftwareItem {
  _id?: string
  label: string
  fields: SoftwareField[]
}

interface SoftwareListResponse {
  data?: SoftwareItem[]
  total?: number
  page?: number
  limit?: number
}

const createRecord = <T>(factory: () => T): Record<SoftwareTabKey, T> => ({
  logiciel: factory(),
  logicielIA: factory(),
  voixIA: factory()
})

export const useLogicielStore = defineStore('logiciel', {
  state: () => ({
    lists: createRecord<SoftwareItem[]>(() => []),
    totals: createRecord<number>(() => 0),
    loading: createRecord<boolean>(() => false),
    loaded: createRecord<boolean>(() => false)
  }),
  actions: {
    async fetchSoftware(type: SoftwareTabKey, search?: string) {
      this.loading[type] = true

      try {
        const response = await $fetch<SoftwareListResponse>(`/api/logiciels/${type}`, {
          query: {
            search: search || undefined
          }
        })

        const data = Array.isArray(response?.data) ? response.data : []

        this.lists[type] = data
        this.totals[type] = typeof response?.total === 'number' ? response.total : data.length
        this.loaded[type] = true

        return data
      } catch (error) {
        this.loaded[type] = false
        throw error
      } finally {
        this.loading[type] = false
      }
    },
    async createSoftware(type: SoftwareTabKey, payload: { label: string; fields: SoftwareField[] }) {
      await $fetch(`/api/logiciels/${type}`, {
        method: 'POST',
        body: payload
      })
    },
    async updateSoftware(type: SoftwareTabKey, id: string, payload: { label: string; fields: SoftwareField[] }) {
      await $fetch(`/api/logiciels/${type}/${id}`, {
        method: 'PUT',
        body: payload
      })
    },
    async deleteSoftware(type: SoftwareTabKey, id: string) {
      await $fetch(`/api/logiciels/${type}/${id}`, {
        method: 'DELETE'
      })
    },
    resetLoaded(type?: SoftwareTabKey) {
      if (type) {
        this.loaded[type] = false
        return
      }

      this.loaded.logiciel = false
      this.loaded.logicielIA = false
      this.loaded.voixIA = false
    }
  }
})
