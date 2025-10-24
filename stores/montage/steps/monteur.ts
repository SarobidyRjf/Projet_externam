import { defineStore } from 'pinia';

import type { MontageDetails, MontageUserSummary, SaveMontageResult } from '../interfaces';
import { defaultMontageDetails } from '../interfaces';
import { normalizeScriptState } from '../interfaces';

const toUserSummary = (value: any): MontageUserSummary | null => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return { _id: value };
  }

  const id = typeof value._id === 'string' ? value._id : null;
  if (!id) {
    return null;
  }

  return {
    _id: id,
    nom: typeof value.nom === 'string' ? value.nom : undefined,
    prenom: typeof value.prenom === 'string' ? value.prenom : undefined,
    email: typeof value.email === 'string' ? value.email : undefined,
  };
};

const normalizeMontageDetails = (data: any, leadId: string): MontageDetails => {
  const base = defaultMontageDetails(leadId);

  const assignedMonteurs = Array.isArray(data?.assignedMonteurs)
    ? data.assignedMonteurs
        .map((entry: any) => toUserSummary(entry))
        .filter((entry): entry is MontageUserSummary => Boolean(entry))
    : base.assignedMonteurs;

  return {
    _id: typeof data?._id === 'string' ? data._id : base._id,
    lead: typeof data?.lead === 'string' ? data.lead : base.lead,
    assignedMonteurs,
    script: normalizeScriptState(data?.script ?? base.script),
  };
};

interface MontageMonteurState {
  montagesByLead: Record<string, MontageDetails>;
  loading: boolean;
  saving: boolean;
}

export const useMontageMonteurStore = defineStore('montageMonteurStore', {
  state: (): MontageMonteurState => ({
    montagesByLead: {},
    loading: false,
    saving: false,
  }),
  actions: {
    setMontage(leadId: string, details: MontageDetails) {
      if (!leadId) {
        return;
      }

      this.montagesByLead = {
        ...this.montagesByLead,
        [leadId]: details,
      };
    },
    clearMontage(leadId: string) {
      if (!leadId || !(leadId in this.montagesByLead)) {
        return;
      }

      const { [leadId]: _removed, ...rest } = this.montagesByLead;
      this.montagesByLead = rest;
    },
    async fetchMontage(leadId: string): Promise<MontageDetails> {
      if (!leadId) {
        return defaultMontageDetails('');
      }

      this.loading = true;

      try {
        const response = await $fetch<{ success: boolean; data?: any }>(`/api/montage/${leadId}`);
        const details = normalizeMontageDetails(response?.data ?? {}, leadId);
        this.setMontage(leadId, details);
        return details;
      } catch (error) {
        console.error('Erreur lors du chargement du montage :', error);
        const fallback = defaultMontageDetails(leadId);
        this.setMontage(leadId, fallback);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async saveAssignments(leadId: string, monteurIds: string[] = []): Promise<SaveMontageResult> {
      if (!leadId) {
        throw new Error('leadId is required to save monteur assignments');
      }

      if (!Array.isArray(monteurIds)) {
        throw new Error('monteurIds must be an array');
      }

      const normalizedIds = monteurIds.filter((id) => typeof id === 'string' && id.length > 0);
      const current = this.montagesByLead[leadId] ?? defaultMontageDetails(leadId);

      this.saving = true;

      try {
        const response = await $fetch<{ success: boolean; data?: any; message?: string }>('/api/montage/monteur', {
          method: 'POST',
          body: {
            leadId,
            monteurIds: normalizedIds,
          },
        });

        const merged = normalizeMontageDetails(
          {
            ...current,
            ...(response?.data ?? {}),
            script: current.script,
          },
          leadId,
        );

        this.setMontage(leadId, merged);

        return {
          message: response?.message ?? 'Monteur enregistré avec succès.',
          montage: merged,
        };
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du monteur :', error);
        throw error;
      } finally {
        this.saving = false;
      }
    },
  },
});
