<template>
  <section class="max-h-[480px] overflow-y-scroll p-4">
    <h2 class="text-xl font-semibold">Montage</h2>
    <div class="mt-4">
      <Stepper v-slot="{ goToStep, modelValue }" class="flex-col gap-6" :linear="false">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
            <StepperItem v-for="(step, index) in visibleSteps" :key="step.id" :step="step.stepperId" class="flex-1">
              <StepperTrigger
                class="flex-1 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition hover:border-primary/70 data-[state=active]:border-primary"
              >
                <div class="flex items-center gap-3">
                  <StepperIndicator class="h-8 w-8 text-base">{{ step.displayId }}</StepperIndicator>
                  <div class="flex flex-col items-start">
                    <StepperTitle class="text-xs font-bold ">{{ step.title }}</StepperTitle>
                    <StepperDescription>{{ step.subtitle }}</StepperDescription>
                  </div>
                </div>
              </StepperTrigger>
              <StepperSeparator
                v-if="index < visibleSteps.length - 1"
                class="mt-4 hidden h-[2px] flex-1 rounded-full bg-border lg:mt-0 lg:block"
              />
            </StepperItem>
          </div>
        </div>

        <div class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          <component
            :is="getStepComponent(modelValue)"
            v-model:assigned-users="assignedUsers"
            :go-to-step="goToStep"
            :current-step="modelValue ?? firstVisibleStepperId"
            :total-steps="visibleSteps.length"
            v-bind="getStepProps(modelValue)"
          />
        </div>
      </Stepper>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { Stepper, StepperItem, StepperTrigger, StepperIndicator, StepperTitle, StepperDescription, StepperSeparator } from '@/components/ui/stepper'

import GenerationStep from './montage/GenerationStep.vue'
import MonteurStep from './montage/MonteurStep.vue'
import ScriptStep from './montage/ScriptStep.vue'
import VideoGenereStep from './montage/VideoGenereStep.vue'
import ValidationStep from './montage/ValidationStep.vue'
import LivraisonStep from './montage/LivraisonStep.vue'
import CorrectionStep from './montage/CorrectionStep.vue'
import { useMontageMonteurStore, defaultScriptState } from '~/stores/montage'
import type { MontageScriptState } from '~/stores/montage'
import { useAuthStore } from '~/stores/auth'

type StepKey =
  | 'monteur'
  | 'script'
  | 'generation'
  | 'videos'
  | 'validation'
  | 'corrections'
  | 'livraison'

type Step = {
  id: number
  key: StepKey
  title: string
  subtitle: string
  component: Component
}

type VisibleStep = Step & {
  stepperId: number
  displayId: number
}

const props = defineProps<{
  leadId?: string
}>()

const allSteps: Step[] = [
  {
    id: 1,
    key: 'monteur',
    title: 'Monteur',
    subtitle: 'Informations monteur',
    component: MonteurStep,
  },
  {
    id: 2,
    key: 'script',
    title: 'Script',
    subtitle: 'Préparation du script',
    component: ScriptStep,
  },
  {
    id: 3,
    key: 'generation',
    title: 'Génération',
    subtitle: 'Validation finale',
    component: GenerationStep,
  },
  {
    id: 4,
    key: 'videos',
    title: 'Vidéos',
    subtitle: 'Vidéos générées',
    component: VideoGenereStep,
  },
  {
    id: 5,
    key: 'validation',
    title: 'Validation',
    subtitle: 'Validation finale',
    component: ValidationStep,
  },
  {
    id: 6,
    key: 'corrections',
    title: 'Corrections',
    subtitle: 'Corrections vidéos',
    component: CorrectionStep,
  },
  {
    id: 7,
    key: 'livraison',
    title: 'Livraison',
    subtitle: 'Livraison des vidéos',
    component: LivraisonStep,
  },
]

const assignedUsers = defineModel<string[]>('assignedUsers', { default: () => [] })
const scriptState = ref<MontageScriptState>(defaultScriptState())

const monteurStore = useMontageMonteurStore()
const { montagesByLead } = storeToRefs(monteurStore)
const authStore = useAuthStore()
const { userConnected } = storeToRefs(authStore)

const restrictedStepKeys = new Set<StepKey>(['monteur', 'script', 'validation'])

const canViewRestrictedSteps = computed(() => {
  const role = userConnected.value?.role?.name ?? ''

  return role === 'super_admin' || role === 'responsable_commercial'
})

const visibleSteps = computed<VisibleStep[]>(() => {
  const allowRestrictedSteps = canViewRestrictedSteps.value
  const baseSteps = allowRestrictedSteps
    ? allSteps
    : allSteps.filter((step) => !restrictedStepKeys.has(step.key))

  return baseSteps.map((step, index) => {
    if (allowRestrictedSteps) {
      return {
        ...step,
        stepperId: step.id,
        displayId: step.id,
      }
    }

    const sequentialId = index + 1

    return {
      ...step,
      stepperId: sequentialId,
      displayId: sequentialId,
    }
  })
})

const firstVisibleStepperId = computed(() => visibleSteps.value[0]?.stepperId ?? allSteps[0]?.id ?? 1)

const currentMontage = computed(() => {
  if (!props.leadId) {
    return null
  }

  return montagesByLead.value[props.leadId] ?? null
})

const applyFetchedScriptState = (state: Partial<MontageScriptState> | null | undefined) => {
  if (!state) {
    scriptState.value = defaultScriptState()
    return
  }

  scriptState.value = {
    notes: state.notes ?? '',
    isValidated: Boolean(state.isValidated),
    updatedAt: state.updatedAt ?? null,
    attachments: Array.isArray(state.attachments) ? state.attachments.map((attachment) => ({
      _id: typeof attachment._id === 'string' ? attachment._id : '',
      fileName: attachment.fileName,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      url: attachment.url,
      uploadedAt: attachment.uploadedAt,
    })).filter((attachment) => attachment._id) : [],
  }
}

watch(
  () => props.leadId,
  (leadId) => {
    if (leadId && leadId.length) {
      monteurStore
        .fetchMontage(leadId)
        .catch((error) => {
          console.error('Erreur lors du chargement des données de montage :', error)
          applyFetchedScriptState(null)
          assignedUsers.value = []
        })
    } else {
      applyFetchedScriptState(null)
      assignedUsers.value = []
    }
  },
  { immediate: true }
)

watch(
  () => currentMontage.value?.script,
  (script) => {
    if (script) {
      applyFetchedScriptState(script)
    } else {
      applyFetchedScriptState(null)
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => currentMontage.value?.assignedMonteurs,
  (assigned) => {
    if (!Array.isArray(assigned)) {
      return
    }

    const ids = assigned
      .map((entry) => {
        if (!entry) {
          return null
        }

        if (typeof entry === 'string') {
          return entry
        }

        if (typeof entry === 'object' && '_id' in entry) {
          return String(entry._id)
        }

        return null
      })
      .filter((id): id is string => typeof id === 'string' && id.length > 0)

    assignedUsers.value = ids
  },
  { immediate: true, deep: true }
)

const updateScriptState = (value: MontageScriptState) => {
  scriptState.value = {
    notes: value?.notes ?? '',
    isValidated: Boolean(value?.isValidated),
    updatedAt: value?.updatedAt ?? null,
    attachments: Array.isArray(value?.attachments) ? value.attachments : [],
  }
}

const getVisibleStep = (stepperId: number | undefined) => {
  const fallbackId = stepperId ?? firstVisibleStepperId.value

  return visibleSteps.value.find((step) => step.stepperId === fallbackId)
}

const getStepComponent = (stepperId: number | undefined) =>
  getVisibleStep(stepperId)?.component ?? visibleSteps.value[0]?.component ?? MonteurStep

const getStepProps = (stepperId: number | undefined) => {
  const step = getVisibleStep(stepperId)

  if (!step) {
    return {}
  }

  if (step.key === 'monteur') {
    return { leadId: props.leadId }
  }

  if (step.key === 'script') {
    return {
      leadId: props.leadId,
      scriptState: scriptState.value,
      'onUpdate:scriptState': updateScriptState,
    }
  }

  return {}
}
</script>
