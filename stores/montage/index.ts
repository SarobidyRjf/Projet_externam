import { defineStore } from 'pinia';

import type { MontageLead, MontageLeadParams, MontageLeadResponse } from './interfaces';

export * from './interfaces';
export { useMontageMonteurStore } from './steps/monteur';
export { useMontageScriptStore, defaultScriptState } from './steps/script';

export const useMontageStore = defineStore('montageStore', {
  state: () => ({
    leads: [] as MontageLead[],
    total: 0,
    loading: false,
  }),
  actions: {
    async fetchAssignedLeads(params: MontageLeadParams = {}) {
      const { page = 1, limit = 20, search } = params;

      try {
        this.loading = true;
        const response = await $fetch<MontageLeadResponse>('/api/montage/leads', {
          params: {
            page,
            limit,
            search: search && search.trim() ? search.trim() : undefined,
          },
        });

        this.leads = response?.data ?? [];
        this.total = response?.total ?? 0;
        return response;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
