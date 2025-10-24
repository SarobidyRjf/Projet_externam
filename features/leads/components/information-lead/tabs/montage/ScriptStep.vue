<template>
  <div class="space-y-6 text-sm text-muted-foreground">
    <p>
      Renseignez le script associé au montage et ajoutez les pièces jointes nécessaires.
    </p>

    <div class="space-y-4 text-left text-sm text-foreground">
      <div class="space-y-2">
        <label for="script-content" class="text-sm font-medium text-slate-700">Contenu du script</label>
        <Textarea
          id="script-content"
          v-model="scriptState.notes"
          class="min-h-[120px]"
          placeholder="Rédigez ou collez ici le script prévu pour le montage."
        />
      </div>

      <div class="space-y-2">
        <label for="script-attachment" class="text-sm font-medium text-slate-700">Pièces jointes</label>
        <input
          id="script-attachment"
          ref="fileInputRef"
          class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          type="file"
          multiple
          @change="onFileChange"
        />
        <p class="text-xs text-muted-foreground">
          Vous pouvez ajouter plusieurs fichiers (PDF, documents texte, images, etc.).
        </p>
      </div>

      <div v-if="pendingFiles.length" class="space-y-2">
        <p class="text-sm font-medium">Pièces jointes à ajouter</p>
        <ul class="space-y-2">
          <li
            v-for="file in pendingFiles"
            :key="file.id"
            class="flex items-center justify-between rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm"
          >
            <span class="truncate">{{ file.file.name }}</span>
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{{ formatFileSize(file.file.size) }}</span>
              <Button variant="ghost" size="sm" class="h-7 px-2 text-xs" @click="removePendingFile(file.id)">
                Retirer
              </Button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="existingAttachments.length" class="space-y-2">
        <p class="text-sm font-medium">Pièces jointes enregistrées</p>
        <ul class="space-y-2">
          <li
            v-for="attachment in existingAttachments"
            :key="attachment._id"
            class="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <a
              v-if="attachment.url"
              :href="attachment.url"
              target="_blank"
              rel="noopener"
              class="truncate text-primary hover:underline"
            >
              {{ attachment.originalName || attachment.fileName || 'Pièce jointe' }}
            </a>
            <span v-else class="truncate">{{ attachment.originalName || attachment.fileName || 'Pièce jointe' }}</span>
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <span v-if="attachment.size">{{ formatFileSize(attachment.size) }}</span>
              <Button
                variant="ghost"
                size="sm"
                class="h-7 px-2 text-xs text-destructive hover:text-destructive"
                @click="removeExistingAttachment(attachment._id)"
              >
                Supprimer
              </Button>
            </div>
          </li>
        </ul>
      </div>

      <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Checkbox v-model:checked="scriptState.isValidated" />
        Script validé
      </label>

      <div class="flex justify-end">
        <Button type="button" class="ml-auto" :disabled="isSaving" @click="saveScript()">
          <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
          Enregistrer le script
        </Button>
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-2">
      <Button v-if="hasPrevious" variant="outline" :disabled="isSaving" @click="goToPrevious">Précédent</Button>
      <Button v-if="hasNext" :disabled="isSaving" @click="handleNext">
        <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
        Suivant
      </Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useMontageScriptStore } from '~/stores/montage'
import type { MontageScriptAttachment, MontageScriptState } from '~/stores/montage'

interface PendingFile {
  id: string
  file: File
}

const props = defineProps<{
  goToStep: (step: number) => void
  currentStep: number
  totalSteps: number
  leadId?: string
  scriptState: MontageScriptState
}>()

const emit = defineEmits<{
  (e: 'update:scriptState', value: MontageScriptState): void
}>()

const scriptStore = useMontageScriptStore()
const { saving } = storeToRefs(scriptStore)

const isSaving = computed(() => saving.value)
const fileInputRef = ref<HTMLInputElement | null>(null)
const pendingFiles = ref<PendingFile[]>([])
const attachmentsMarkedForRemoval = ref(new Set<string>())

const normalizeScriptState = (state?: MontageScriptState): MontageScriptState => ({
  notes: state?.notes ?? '',
  isValidated: Boolean(state?.isValidated),
  updatedAt: state?.updatedAt ?? null,
  attachments: Array.isArray(state?.attachments) ? state.attachments : [],
})

const internalScriptState = ref<MontageScriptState>(normalizeScriptState(props.scriptState))
let syncingFromParent = false

watch(
  () => props.scriptState,
  (value) => {
    syncingFromParent = true
    internalScriptState.value = normalizeScriptState(value)
    nextTick(() => {
      syncingFromParent = false
    })
  },
  { immediate: true, deep: true }
)

watch(
  internalScriptState,
  (value) => {
    if (syncingFromParent) {
      return
    }
    emit('update:scriptState', normalizeScriptState(value))
  },
  { deep: true }
)

const scriptState = internalScriptState

const existingAttachments = computed<MontageScriptAttachment[]>(() =>
  Array.isArray(scriptState.value.attachments) ? scriptState.value.attachments : [],
)

watch(
  () => props.leadId,
  () => {
    pendingFiles.value = []
    attachmentsMarkedForRemoval.value.clear()
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
)

const hasPrevious = computed(() => props.currentStep > 1)
const hasNext = computed(() => props.currentStep < props.totalSteps)

const goToPrevious = () => {
  if (hasPrevious.value) {
    props.goToStep(props.currentStep - 1)
  }
}

const formatFileSize = (size: number) => {
  if (!Number.isFinite(size)) {
    return ''
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} Mo`
  }

  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} Ko`
  }

  return `${size} o`
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || !files.length) {
    return
  }

  const additions = Array.from(files).map((file) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
  }))

  pendingFiles.value = [...pendingFiles.value, ...additions]

  target.value = ''
}

const removePendingFile = (id: string) => {
  pendingFiles.value = pendingFiles.value.filter((file) => file.id !== id)
}

const removeExistingAttachment = (attachmentId: string) => {
  if (!attachmentId) {
    return
  }

  attachmentsMarkedForRemoval.value.add(attachmentId)
  scriptState.value = {
    ...scriptState.value,
    attachments: existingAttachments.value.filter((attachment) => attachment._id !== attachmentId),
  }
}

const saveScript = async (goToNextStep = false) => {
  if (!props.leadId || !props.leadId.length) {
    if (goToNextStep && hasNext.value) {
      props.goToStep(props.currentStep + 1)
    }
    return
  }

  try {
    if (isSaving.value) {
      return
    }

    const removedIds = Array.from(attachmentsMarkedForRemoval.value)
    const files = pendingFiles.value.map((entry) => entry.file)

    const { montage, message } = await scriptStore.saveScript({
      leadId: props.leadId,
      notes: scriptState.value.notes ?? '',
      isValidated: Boolean(scriptState.value.isValidated),
      files,
      removedAttachmentIds: removedIds,
    })

    const script = montage?.script

    scriptState.value = {
      notes: script?.notes ?? scriptState.value.notes ?? '',
      isValidated: Boolean(script?.isValidated ?? scriptState.value.isValidated),
      updatedAt: script?.updatedAt ?? scriptState.value.updatedAt ?? null,
      attachments: Array.isArray(script?.attachments) ? script.attachments : [],
    }

    attachmentsMarkedForRemoval.value.clear()
    pendingFiles.value = []
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }

    toast.success(message || 'Script enregistré avec succès')

    if (goToNextStep && hasNext.value) {
      props.goToStep(props.currentStep + 1)
    }
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde du script :', error)
    toast.error(error?.data?.statusMessage ?? "Une erreur est survenue lors de l'enregistrement du script")
  }
}

const handleNext = async () => {
  if (!hasNext.value) {
    return
  }

  await saveScript(true)
}
</script>
