
interface StatuData{
    _id: string,
    count: number
}

interface TransactionData {
    _id: {
        month: number;
        type: string;
    };
    count: number;
}

interface LeadProcessData {
    _id: string;
    count: number;
}

interface LeadAssignedData {
  period: number;
  count: number;
  user: { _id: string; nom: string; prenom: string };
}

export interface RdvTodayLead {
  _id: string;
  full_name: string;
  date_rdv: string;
  lieu_rdv: string | null;
  type_lieu_rdv?: string;
  assigned_to_user?: Array<{ _id: string; nom?: string; prenom?: string }>;
  [key: string]: any;
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    statusData: [] as StatuData[],
    transactionsData: [] as TransactionData[],
    leadProcessData: [] as LeadProcessData[],
    leadAssignedData: [] as LeadAssignedData[],
    rdvTodayLeads: [] as RdvTodayLead[],
    loading: false,
  }),
  actions: {
    async fetchStatusStats() {
      try {
        this.loading = true;
        const res = await $fetch<{ data: StatuData[] }>('/api/dashboard/statusLead');
        this.statusData = res.data;
      } catch (err) {
        console.log(err);
      } finally {
        this.loading = false;
      }
    },
    async fetchTransactionStats(params?: { year?: number }) {
      try {
        this.loading = true;
        const res = await $fetch<{ data: TransactionData[] }>(
          '/api/dashboard/transactions',
          { params }
        );
        this.transactionsData = res.data;
      } catch (err) {
        console.log(err);
      } finally {
        this.loading = false;
      }
    },
    async fetchLeadProcessStats() {
      try {
        this.loading = true;
        const res = await $fetch<{ data: LeadProcessData[] }>('/api/dashboard/leadToProcess');
        this.leadProcessData = res.data;
      } catch (err) {
        console.log(err);
      } finally {
        this.loading = false;
      }
    },
    async fetchLeadAssignedStats(params?: { period?: string; year?: number; month?: number }) {
      try {
        this.loading = true;
        const res = await $fetch<{ data: LeadAssignedData[] }>(
          '/api/dashboard/leadsAssigned',
          { params }
        );
        this.leadAssignedData = res.data;
      } catch (err) {
        console.log(err);
      } finally {
        this.loading = false;
      }
    },
    async fetchTodayRdvLeads(period = 'day') {
      try {
        this.loading = true;
        const res = await $fetch<{ data: RdvTodayLead[] }>('/api/dashboard/rdvToday', {
          params: { period }
        });
        this.rdvTodayLeads = res.data;
        return res.data;
      } catch (err) {
        console.log(err);
      } finally {
        this.loading = false;
      }
    },
  },
});
