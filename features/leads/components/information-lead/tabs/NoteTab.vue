<template>
  <div class="min-h-[500px] overflow-y-scroll h-[500px]">
    <div class="space-y-4 mt-4">
      <div v-if="dateField" class="space-y-2 w-fit">
        <Label :for="dateField">Date du RDV :</Label>
        <VueDatePicker
          v-model="dateValue"
          :enable-time-picker="true"
          locale="fr-FR"
          cancel-text="Retour"
          select-text="Sélectionner"
          placeholder="Sélectionner une date"
          auto-apply
        />
      </div>
      <div class="space-y-2">
        <Label for="full_name">{{ label }} :</Label>
        <quill-editor v-model:content="dataToSend[field]" contentType="html" theme="snow"></quill-editor>
      </div>
      <p class="text-xs text-muted-foreground mt-2">{{ saveStatusMessage }}</p>
    </div>

    <slot name="paiement">
      <PaymentPlanSection :lead-id="leadId" :initial-plan="initialPaymentPlan" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker';
import PaymentPlanSection from './PaymentPlanSection.vue';
import { useLeadsStore } from '~/stores/leads';
import type { LeadPaymentPlan } from '~/stores/leads/paymentPlan';

const props = withDefaults(defineProps<{
  dataToSend: Record<string, any>;
  field: string;
  label: string;
  dateField?: string;
}>(), {
  dateField: undefined,
});

const { dataToSend, field, label, dateField } = toRefs(props);
const { addInfoLead } = useLeadsStore();

const autoSaveDelay = 1000;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const lastSavedState = ref<{ note: string; date: string | null }>({ note: '', date: null });
const saveStatusMessage = ref('Sauvegarde automatique activée');
const isSaving = ref(false);

const leadId = computed(() => dataToSend.value._id as string | undefined);
const initialPaymentPlan = computed<LeadPaymentPlan | null>(() => {
  const plan = dataToSend.value?.paymentPlan as LeadPaymentPlan | undefined;
  return plan ?? null;
});
const noteContent = computed(() => (dataToSend.value[field.value] ?? '') as string);
const dateFieldName = computed(() => dateField?.value);
const dateValue = computed<Date | string | null>({
  get: () => {
    if (!dateFieldName.value) return null;
    return (dataToSend.value[dateFieldName.value] ?? null) as Date | string | null;
  },
  set: (value) => {
    if (!dateFieldName.value) return;
    dataToSend.value[dateFieldName.value] = value;
  },
});

const normalizeDate = (value: unknown) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const getPendingUpdates = () => {
  const updates: Record<string, any> = {};
  if (noteContent.value !== lastSavedState.value.note) {
    updates[field.value] = noteContent.value;
  }
  if (dateFieldName.value) {
    const normalizedDate = normalizeDate(dateValue.value);
    if (normalizedDate !== lastSavedState.value.date) {
      updates[dateFieldName.value] = dateValue.value ?? null;
    }
  }
  return updates;
};

const resetTimer = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
};

const hasPendingChanges = () => Object.keys(getPendingUpdates()).length > 0;

const performSave = async () => {
  const id = leadId.value;
  if (!id || !hasPendingChanges()) return;
  if (isSaving.value) {
    scheduleSave();
    return;
  }
  isSaving.value = true;
  saveStatusMessage.value = 'Enregistrement en cours...';
  try {
    const updates = getPendingUpdates();
    await addInfoLead(id, updates, {
      silent: true,
      skipHistory: true,
      showLoading: false,
    });
    lastSavedState.value = {
      note: noteContent.value,
      date: dateFieldName.value ? normalizeDate(dateValue.value) : null,
    };
    saveStatusMessage.value = `Dernière sauvegarde automatique à ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde automatique de la note :', error);
    saveStatusMessage.value = 'Erreur lors de la sauvegarde automatique. Nouvelle tentative...';
    scheduleSave();
  } finally {
    isSaving.value = false;
  }
};

const scheduleSave = () => {
  if (!leadId.value || !hasPendingChanges()) return;
  resetTimer();
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    void performSave();
  }, autoSaveDelay);
};

watch(leadId, () => {
  resetTimer();
  lastSavedState.value = {
    note: noteContent.value,
    date: dateFieldName.value ? normalizeDate(dateValue.value) : null,
  };
  saveStatusMessage.value = 'Sauvegarde automatique activée';
}, { immediate: true });

watch(() => noteContent.value, () => {
  if (!leadId.value) return;
  if (!hasPendingChanges()) return;
  scheduleSave();
});

watch(() => dateValue.value, () => {
  if (!leadId.value) return;
  if (!dateFieldName.value) return;
  if (!hasPendingChanges()) return;
  scheduleSave();
});

onBeforeUnmount(() => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
    void performSave();
  }
});
</script>
