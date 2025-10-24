import { defineStore } from 'pinia';
import type { PaymentPackValue } from '~/constants/payment-packs';

export interface PaymentDetailPayload {
  amount: number;
  remaining: number;
  installmentNumber: number;
}

export interface LeadPaymentPlan {
  _id?: string;
  id_lead: string;
  packType: PaymentPackValue;
  videoCount: number;
  price: number;
  paymentCount: number;
  payments: PaymentDetailPayload[];
  customPackValues?: Partial<Record<PaymentPackValue, { price: number | null; videoCount: number | null }>>;
  marketingSupportCount?: number | null;
  marketingSupportPriceHt?: number | null;
  marketingSupportPriceTtc?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertPaymentPlanPayload = Omit<LeadPaymentPlan, '_id' | 'id_lead' | 'createdAt' | 'updatedAt'>;

interface State {
  plans: Record<string, LeadPaymentPlan | null>;
  loading: boolean;
}

export const useLeadPaymentPlanStore = defineStore('leadPaymentPlan', {
  state: (): State => ({
    plans: {},
    loading: false,
  }),
  actions: {
    setPlan(leadId: string, plan: LeadPaymentPlan | null) {
      this.plans = {
        ...this.plans,
        [leadId]: plan,
      };
    },
    async fetchPaymentPlan(leadId: string) {
      try {
        this.loading = true;
        const response = await $fetch<{ plan: LeadPaymentPlan | null }>(`/api/leadMeta/payment-plan/${leadId}`);
        this.setPlan(leadId, response?.plan ?? null);
        return this.plans[leadId] ?? null;
      } catch (error) {
        console.error('Erreur lors de la récupération du plan de paiement :', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async upsertPaymentPlan(leadId: string, payload: UpsertPaymentPlanPayload) {
      try {
        this.loading = true;
        const response = await $fetch<{ plan: LeadPaymentPlan }>(`/api/leadMeta/payment-plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_lead: leadId,
            ...payload,
          }),
        });
        this.setPlan(leadId, response.plan);
        return response.plan;
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du plan de paiement :', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
