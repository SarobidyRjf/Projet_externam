<template>
  <div class="space-y-4">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button variant="outline" class="w-full justify-between">
          <span>{{ buttonLabel }}</span>
          <Icon name="lucide:chevrons-up-down" class="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher un monteur..." />
          <CommandList>
            <CommandEmpty>Aucun monteur trouvé.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                v-for="monteur in monteurOptions"
                :key="monteur._id"
                :value="formatMonteurName(monteur)"
                @select="() => toggleMonteur(monteur._id)"
              >
                <Checkbox
                  :checked="isSelected(monteur._id)"
                  class="mr-2 border-primary/50 pointer-events-none"
                />
                <div class="flex flex-col text-left">
                  <span class="font-medium">{{ formatMonteurName(monteur) }}</span>
                  <span v-if="monteur.email" class="text-xs text-muted-foreground">
                    {{ monteur.email }}
                  </span>
                </div>
              </CommandItem>
            </CommandGroup>
            <template v-if="selectedMonteurDetails.length">
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  :value="'clear-selection'"
                  class="justify-center text-center text-sm text-muted-foreground"
                  @select="clearSelection"
                >
                  Effacer la sélection
                </CommandItem>
              </CommandGroup>
            </template>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <div v-if="selectedMonteurDetails.length" class="flex flex-wrap gap-2">
      <Badge
        v-for="monteur in selectedMonteurDetails"
        :key="monteur._id"
        variant="secondary"
        class="flex items-center gap-2"
      >
        {{ formatMonteurName(monteur) }}
        <button
          type="button"
          class="text-muted-foreground transition hover:text-destructive"
          @click="removeMonteur(monteur._id)"
        >
          <Icon name="lucide:x" class="h-3 w-3" />
        </button>
      </Badge>
    </div>
    <p v-else class="text-sm text-muted-foreground">
      Aucun monteur sélectionné pour le moment.
    </p>

    <div class="mt-6 flex justify-end gap-2">
      <Button
        v-if="hasPrevious"
        variant="outline"
        :disabled="isSaving"
        @click="goToPrevious"
      >
        Précédent
      </Button>
      <Button v-if="hasNext" :disabled="isSaving" @click="handleNext">
        <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
        Suivant
      </Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useUserStore } from '~/stores/user'
import { useMontageMonteurStore } from '~/stores/montage'
import type { MontageUserSummary } from '~/stores/montage'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const assignedUsers = defineModel<string[]>('assignedUsers', { default: () => [] })

const userStore = useUserStore()
const monteurStore = useMontageMonteurStore()
const { getMonteurUser } = userStore
const { user_monteur } = storeToRefs(userStore)
const { saving } = storeToRefs(monteurStore)

const monteurOptions = computed<MontageUserSummary[]>(() => (user_monteur.value as MontageUserSummary[]) ?? [])
const monteurIdSet = computed(() => new Set(monteurOptions.value.map((monteur) => monteur._id)))
const open = ref(false)
const isSaving = computed(() => saving.value)

const props = defineProps<{
  goToStep: (step: number) => void
  currentStep: number
  totalSteps: number
  leadId?: string
}>()

onMounted(async () => {
  if (!monteurOptions.value.length) {
    await getMonteurUser()
  }
})

watch(assignedUsers, (value) => {
  if (!Array.isArray(value)) {
    assignedUsers.value = value ? [value as unknown as string] : []
  }
}, { immediate: true })

const getBaseAssignedIds = () => {
  if (!Array.isArray(assignedUsers.value)) {
    return []
  }

  return assignedUsers.value.filter((id) => !monteurIdSet.value.has(id))
}

const selectedMonteurIds = computed(() => {
  if (!Array.isArray(assignedUsers.value)) {
    return []
  }

  return assignedUsers.value.filter((id) => monteurIdSet.value.has(id))
})

const isSelected = (id: string) => selectedMonteurIds.value.includes(id)

const selectedMonteurDetails = computed<MontageUserSummary[]>(() => {
  return selectedMonteurIds.value
    .map((id) => monteurOptions.value.find((monteur) => monteur._id === id))
    .filter((monteur): monteur is MontageUserSummary => Boolean(monteur))
})

const formatMonteurName = (monteur?: MontageUserSummary) => {
  if (!monteur) {
    return 'Monteur'
  }
  const fullName = [monteur?.prenom, monteur?.nom].filter(Boolean).join(' ').trim()
  return fullName || monteur.email || 'Monteur'
}

const buttonLabel = computed(() => {
  if (!selectedMonteurDetails.value.length) {
    return 'Sélectionner un monteur'
  }

  if (selectedMonteurDetails.value.length === 1) {
    return formatMonteurName(selectedMonteurDetails.value[0])
  }

  return `${selectedMonteurDetails.value.length} monteurs sélectionnés`
})

const updateAssignedUsers = (monteurIds: string[]) => {
  const baseIds = getBaseAssignedIds()
  const uniqueIds = Array.from(new Set([...baseIds, ...monteurIds]))
  assignedUsers.value = uniqueIds
}

const toggleMonteur = (id: string) => {
  if (!id) {
    return
  }

  const current = new Set(selectedMonteurIds.value)
  if (current.has(id)) {
    current.delete(id)
  } else {
    current.add(id)
  }

  updateAssignedUsers([...current])
}

const removeMonteur = (id: string) => {
  if (!monteurIdSet.value.has(id)) {
    return
  }

  const next = selectedMonteurIds.value.filter((userId) => userId !== id)
  updateAssignedUsers(next)
}

const clearSelection = () => {
  updateAssignedUsers([])
}

const hasPrevious = computed(() => props.currentStep > 1)
const hasNext = computed(() => props.currentStep < props.totalSteps)

const goToPrevious = () => {
  if (hasPrevious.value) {
    props.goToStep(props.currentStep - 1)
  }
}

const saveMonteurSelection = async (goToNextStep = false) => {
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

    const { montage, message } = await monteurStore.saveAssignments(props.leadId, selectedMonteurIds.value)

    const serverMonteurs = Array.isArray(montage?.assignedMonteurs) ? montage.assignedMonteurs : []
    const normalized = serverMonteurs
      .map((entry: any) => {
        if (!entry) {
          return null
        }

        if (typeof entry === 'string') {
          return entry
        }

        if (entry && typeof entry === 'object' && '_id' in entry) {
          return String(entry._id)
        }

        return null
      })
      .filter((id): id is string => typeof id === 'string' && id.length > 0)

    updateAssignedUsers(normalized)
    toast.success(message || 'Monteur enregistré avec succès')

    if (goToNextStep && hasNext.value) {
      props.goToStep(props.currentStep + 1)
    }
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde du monteur :', error)
    toast.error(error?.data?.statusMessage ?? "Une erreur est survenue lors de l'enregistrement du monteur")
  }
}

const handleNext = async () => {
  if (!hasNext.value) {
    return
  }

  await saveMonteurSelection(true)
}
</script>
