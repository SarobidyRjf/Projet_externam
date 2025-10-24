<template>
  <div class="min-h-[500px]">
    <div class="space-y-4 mt-4">
      <div class="space-y-2 w-fit">
        <Label for="date_rdv_R1">Date du RDV :</Label>
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
        <Label for="full_name">Note :</Label>
        <quill-editor v-model:content="dataToSend.note_R1" contentType="html" theme="snow"></quill-editor>
      </div>
      <p class="text-xs text-muted-foreground mt-2">{{ saveStatusMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker';
import { useLeadsStore } from '~/stores/leads';

const props = defineProps<{
  dataToSend: Record<string, any>;
}>();

const { dataToSend } = toRefs(props);
const { addInfoLead } = useLeadsStore();

const autoSaveDelay = 1000;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const saveStatusMessage = ref('Sauvegarde automatique activée');
const isSaving = ref(false);
const lastSavedState = ref<{ note: string; date: string | null }>({ note: '', date: null });

const leadId = computed(() => dataToSend.value._id as string | undefined);
const noteContent = computed(() => (dataToSend.value.note_R1 ?? '') as string);
const dateValue = computed<Date | string | null>({
  get: () => (dataToSend.value.date_rdv_R1 ?? null) as Date | string | null,
  set: (value) => {
    dataToSend.value.date_rdv_R1 = value;
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
    updates.note_R1 = noteContent.value;
  }
  const normalizedDate = normalizeDate(dateValue.value);
  if (normalizedDate !== lastSavedState.value.date) {
    updates.date_rdv_R1 = dateValue.value ?? null;
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
      date: normalizeDate(dateValue.value),
    };
    saveStatusMessage.value = `Enregistré automatiquement à ${new Date().toLocaleTimeString()}`;
    // saveStatusMessage.value = `Enregistré automatiquement à ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde automatique de la note R1 :', error);
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
    date: normalizeDate(dateValue.value),
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
