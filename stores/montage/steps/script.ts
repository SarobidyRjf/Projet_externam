import { defineStore } from 'pinia';

import type { MontageDetails } from '../interfaces';
import type { SaveMontageResult, SaveMontageScriptPayload } from '../interfaces';
import { defaultMontageDetails, normalizeScriptState } from '../interfaces';
import { useMontageMonteurStore } from './monteur';

export const useMontageScriptStore = defineStore('montageScriptStore', {
  state: () => ({
    saving: false,
  }),
  actions: {
    async saveScript(payload: SaveMontageScriptPayload): Promise<SaveMontageResult> {
      const { leadId } = payload;

      if (!leadId) {
        throw new Error('leadId is required to save the script');
      }

      this.saving = true;

      try {
        const formData = new FormData();
        formData.append('leadId', leadId);
        formData.append('notes', payload.notes ?? '');
        formData.append('isValidated', String(Boolean(payload.isValidated)));

        for (const file of payload.files ?? []) {
          formData.append('attachments', file);
        }

        for (const id of payload.removedAttachmentIds ?? []) {
          if (id) {
            formData.append('removedAttachmentIds', id);
          }
        }

        const response = await $fetch<{ success: boolean; data?: any; message?: string }>(
          '/api/montage/script',
          {
            method: 'POST',
            body: formData,
          },
        );

        const script = normalizeScriptState(response?.data?.script);
        const monteurStore = useMontageMonteurStore();
        const current = monteurStore.montagesByLead[leadId] ?? defaultMontageDetails(leadId);

        const updatedMontage: MontageDetails = {
          ...current,
          _id: typeof response?.data?._id === 'string' ? response.data._id : current._id,
          lead: typeof response?.data?.lead === 'string' ? response.data.lead : current.lead,
          script,
        };

        monteurStore.setMontage(leadId, updatedMontage);

        return {
          message: response?.message ?? 'Script enregistré avec succès.',
          montage: updatedMontage,
        };
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du script :', error);
        throw error;
      } finally {
        this.saving = false;
      }
    },
  },
});

export { defaultScriptState } from '../interfaces';
