import { defineStore } from 'pinia';

interface HistoryMeta {
  fields?: string[];
}

interface HistoryEntry {
  _id: string;
  action: string;
  meta?: HistoryMeta;
  user?: { nom?: string; prenom?: string };
  createdAt: string;
}

export const useLeadHistory = defineStore('leadHistory', {
  state: () => ({
    history: [] as HistoryEntry[],
    loading: false,
  }),
  actions: {
    async fetchHistory(leadId: string) {
      try {
        this.loading = true;
        const res: HistoryEntry[] = await $fetch(`/api/leadMeta/manage/history/${leadId}`);
        this.history = res || [];
      } catch (err) {
        console.log(err);
      } finally {
        this.loading = false;
      }
    },
    async addHistory(leadId: string, action: string, fields: string[] = []) {
      try {
        const entry: HistoryEntry = await $fetch(`/api/leadMeta/manage/history/${leadId}`, {
          method: 'POST',
          body: { action, meta: { fields } }
        });
        this.history.unshift(entry)
      } catch (err) {
        console.log(err);
      }
    }
  }
});
