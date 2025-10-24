<template>
  <Dialog v-model:open="openDialog">
    <DialogContent class="sm:max-w-7xl">
      <DialogHeader>
        <DialogTitle class="text-xl font-semibold text-orange-500">
          {{ lead?.full_name || 'Lead montage' }}
        </DialogTitle>
        <DialogDescription>
          Gérez les informations de montage pour ce lead.
        </DialogDescription>
      </DialogHeader>

      <div v-if="lead" class="space-y-4">
        <MontageTab v-model:assigned-users="form.assigned_to_user" :lead-id="lead?._id" />
      </div>
      <p v-else class="text-sm text-muted-foreground">
        Sélectionnez un lead pour afficher les détails du montage.
      </p>

      <DialogFooter>
        <Button variant="outline" @click="openDialog = false">Fermer</Button>
        <Button :disabled="saving" @click="handleSubmit">
          <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
          Enregistrer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import { useLeadsStore } from '~/stores/leads';
import MontageTab from '@/features/leads/components/information-lead/tabs/MontageTab.vue';

const props = defineProps<{
  open: boolean;
  lead: Record<string, any> | null;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'saved', leadId: string): void;
}>();

const { addInfoLead } = useLeadsStore();
const saving = ref(false);

const openDialog = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
});

const form = ref<{ assigned_to_user: string[] }>({ assigned_to_user: [] });

const normalizeAssignedUsers = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry;
        }
        if (entry && typeof entry === 'object' && '_id' in entry && typeof (entry as any)._id === 'string') {
          return (entry as any)._id;
        }
        return null;
      })
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
  }

  if (typeof value === 'string') {
    return value ? [value] : [];
  }

  if (value && typeof value === 'object' && '_id' in value && typeof (value as any)._id === 'string') {
    return [(value as any)._id];
  }

  return [];
};

const resetForm = () => {
  form.value = { assigned_to_user: [] };
};

watch(
  () => props.lead,
  (lead) => {
    if (!lead) {
      resetForm();
      return;
    }

    form.value = {
      assigned_to_user: normalizeAssignedUsers(lead.assigned_to_user),
    };
  },
  { immediate: true }
);

const handleSubmit = async () => {
  if (!props.lead?._id) {
    return;
  }

  try {
    saving.value = true;
    await addInfoLead(
      props.lead._id,
      {
        id_lead: props.lead._id,
        assigned_to_user: form.value.assigned_to_user,
      },
      { skipHistory: true, showLoading: false }
    );
    emit('saved', props.lead._id);
    openDialog.value = false;
  } catch (error) {
    console.error(error);
  } finally {
    saving.value = false;
  }
};
</script>
