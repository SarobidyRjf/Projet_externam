<template>
  <div class="space-y-6 text-sm text-muted-foreground">
    <div v-for="group in softwareGroups" :key="group.type" class="space-y-2">
      <Label>{{ group.label }}</Label>
      <div class="flex flex-col gap-3">
        <template v-if="group.options.length">
          <label
            v-for="option in group.options"
            :key="option.key"
            class="flex items-center gap-2 text-foreground"
            :for="`software-${option.key}`"
          >
            <Checkbox
              :id="`software-${option.key}`"
              :model-value="selectedSoftwares.includes(option.key)"
              @update:model-value="(checked) => toggleSoftware(option.key, !!checked)"
            />
            <span>{{ option.label }}</span>
          </label>
        </template>
        <p v-else class="text-xs italic text-muted-foreground">Aucun logiciel disponible.</p>
      </div>
    </div>

    <div
      v-for="option in selectedSoftwareOptions"
      :key="option.key"
      class="grid gap-4 rounded-lg border border-dashed p-4"
    >
      <p class="text-base font-medium text-foreground">
        {{ option.label }}
      </p>
      <template v-if="isConfigurableSoftware(option.category)">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <Label :for="`video-count-${option.key}`">Nombre de vidéos générées</Label>
            <Input
              :id="`video-count-${option.key}`"
              v-model="softwareSelections[option.key].videoCount"
              class="mt-2"
              type="number"
              min="0"
              max="100"
              placeholder=""
            />
          </div>
          <div>
            <Label :for="`custom-field-${option.key}`">{{ getCustomFieldLabel(option) }}</Label>
            <template v-if="shouldUseSelectField(option)">
              <Select v-model="softwareSelections[option.key].customField">
                <SelectTrigger :id="`custom-field-${option.key}`" class="mt-2 w-full">
                  <SelectValue :placeholder="getSelectPlaceholder(option)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="field in option.fields"
                    :key="`${option.key}-${field.key}`"
                    :value="field.key"
                  >
                    {{ field.key }}<span v-if="field.value"> ({{ field.value }})</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </template>
            <template v-else-if="shouldShowSingleFieldInput(option)">
              <Input
                :id="`custom-field-${option.key}`"
                v-model="softwareSelections[option.key].customField"
                class="mt-2"
                :placeholder="option.fields[0].value"
              />
              <p class="mt-1 text-xs text-muted-foreground">{{ option.fields[0].key }}</p>
            </template>
            <p v-else class="mt-2 text-xs italic text-muted-foreground">
              Aucun champ personnalisé configuré pour ce logiciel.
            </p>
          </div>
        </div>
      </template>
      <p v-else class="text-xs text-muted-foreground">
        Aucun paramètre supplémentaire n'est requis pour ce logiciel.
      </p>
    </div>
  </div>
  <div class="mt-6 flex justify-end gap-2">
      <Button v-if="hasPrevious" variant="outline" @click="goToPrevious">Précédent</Button>
      <Button v-if="hasNext" @click="goToNext">Suivant</Button>
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import type { SoftwareItem, SoftwareTabKey } from '~/stores/logiciel'
import { useLogicielStore } from '~/stores/logiciel'

const props = defineProps<{
  goToStep: (step: number) => void
  currentStep: number
  totalSteps: number
}>()

type SoftwareSelectionState = {
  videoCount: number | ''
  customField: string
}

const logicielStore = useLogicielStore()
const { lists, loaded } = storeToRefs(logicielStore)

const softwareCategories: { type: SoftwareTabKey; label: string }[] = [
  { type: 'logicielIA', label: 'Logiciels IA' },
  { type: 'voixIA', label: 'Voix IA' },
  { type: 'logiciel', label: 'Logiciels' }
]

onMounted(async () => {
  await Promise.all(
    softwareCategories.map(async ({ type }) => {
      if (!loaded.value[type]) {
        try {
          await logicielStore.fetchSoftware(type)
        } catch (error) {
          console.error('Impossible de récupérer les logiciels', error)
        }
      }
    })
  )
})

const createOptionKey = (category: SoftwareTabKey, item: SoftwareItem) => {
  const base = item._id ?? item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `${category}:${base}`
}

type SoftwareOption = {
  key: string
  label: string
  category: SoftwareTabKey
  fields: SoftwareItem['fields']
}

const softwareGroups = computed(() =>
  softwareCategories.map((category) => ({
    ...category,
    options: (lists.value[category.type] ?? []).map((item) => ({
      key: createOptionKey(category.type, item),
      label: item.label,
      category: category.type,
      fields: item.fields ?? []
    }))
  }))
)

const optionMap = computed<Record<string, SoftwareOption>>(() => {
  const map: Record<string, SoftwareOption> = {}
  softwareGroups.value.forEach((group) => {
    group.options.forEach((option) => {
      map[option.key] = option
    })
  })
  return map
})

const selectedSoftwares = ref<string[]>([])
const softwareSelections = reactive<Record<string, SoftwareSelectionState>>({})

const ensureSelectionState = (key: string) => {
  if (!softwareSelections[key]) {
    const option = optionMap.value[key]
    softwareSelections[key] = {
      videoCount: '',
      customField: option && option.fields.length === 1 ? option.fields[0].key : ''
    }
  }
}

watch(
  selectedSoftwares,
  (newSelected, oldSelected = []) => {
    newSelected.forEach((key) => {
      ensureSelectionState(key)
    })

    oldSelected
      .filter((key) => !newSelected.includes(key))
      .forEach((key) => {
        delete softwareSelections[key]
      })
  },
  { immediate: true }
)

const selectedSoftwareOptions = computed(() =>
  selectedSoftwares.value
    .map((key) => optionMap.value[key])
    .filter((option): option is SoftwareOption => Boolean(option))
)

watch(
  selectedSoftwareOptions,
  (options) => {
    options.forEach((option) => {
      const state = softwareSelections[option.key]
      if (state && !state.customField && option.fields.length === 1) {
        state.customField = option.fields[0].key
      }
    })
  },
  { immediate: true }
)

const toggleSoftware = (key: string, checked: boolean) => {
  if (checked) {
    if (!selectedSoftwares.value.includes(key)) {
      selectedSoftwares.value = [...selectedSoftwares.value, key]
      ensureSelectionState(key)
    }
  } else {
    selectedSoftwares.value = selectedSoftwares.value.filter((item) => item !== key)
  }
}

const isConfigurableSoftware = (category: SoftwareTabKey | undefined) =>
  category === 'logicielIA' || category === 'voixIA'

const shouldUseSelectField = (option: SoftwareOption) => {
  if (option.category === 'voixIA') {
    return option.fields.length > 0
  }
  return option.fields.length > 1
}

const shouldShowSingleFieldInput = (option: SoftwareOption) =>
  option.category !== 'voixIA' && option.fields.length === 1

const getCustomFieldLabel = (option: SoftwareOption) =>
  option.category === 'voixIA' ? 'Voix IA' : 'Champ personnalisé'

const getSelectPlaceholder = (option: SoftwareOption) =>
  option.category === 'voixIA' ? '-- Choisir une voix --' : '-- Choisir un champ --'

const hasPrevious = computed(() => props.currentStep > 1)
const hasNext = computed(() => props.currentStep < props.totalSteps)

const goToPrevious = () => {
  if (hasPrevious.value) {
    props.goToStep(props.currentStep - 1)
  }
}

const goToNext = () => {
  if (hasNext.value) {
    props.goToStep(props.currentStep + 1)
  }
}
</script>
