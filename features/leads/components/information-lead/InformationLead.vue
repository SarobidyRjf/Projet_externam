<template>
    <Dialog v-model:open="open">
        <DialogContent maxWidth="max-w-7xl" class="h-[700px]">
            <DialogHeader>
                <DialogTitle class="text-xl text-[#ff8c00]">{{ props.lead?.full_name }} </DialogTitle>
                <div v-if="appointmentBadgeText" class=" flex justify-center">
                    <Badge :class="appointmentBadgeClasses">
                        <Icon :name="appointmentBadgeIcon" class="h-4 w-4" />
                        <span>{{ appointmentBadgeText }}</span>
                    </Badge>
                </div>
                <DialogDescription class="">
                    <Tabs v-model="selectedTab" class="w-[100%]">
                        <TabsList class="flex flex-wrap gap-2">
                            <template v-for="tab in dynamicTabs" :key="tab.value">
                                <TabsTrigger :value="tab.value">
                                    {{ tab.label }}
                                    <Icon v-if="isCloseButtonVisible(tab.value)" name="lucide:x" class="h-3 w-3 cursor-pointer" @click="closeTab(tab.value)" />
                                </TabsTrigger>
                            </template>

                            <DropdownMenu>
                                <DropdownMenuTrigger as-child>
                                    <Tabs class="text-slate-500 flex">
                                        <Icon name="hugeicons:add-circle" class="w-4 h-4 cursor-pointer" size="24" />
                                    </Tabs>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem v-for="option in tabOptions" :key="option" @click="addTab(option)">
                                        {{ option }}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TabsList>
                        <TabsContent value="info">
                            <GeneralInfoTab
                              :data-to-send="dataToSend"
                              :v$="v$"
                              :status-options="statusOptions"
                              :status-selections="statusSelections"
                              :status-dates="statusDates"
                              :rdv-occurrences="rdvOccurrences"
                              :rdv-type-options="rdvTypeOptions"
                              @toggle-status="toggleStatusSelection"
                              @update-status-date="updateStatusDate"
                              @add-rdv-occurrence="addRdvOccurrence"
                              @remove-rdv-occurrence="removeRdvOccurrence"
                              @update-rdv-occurrence="updateRdvOccurrence"
                            />
                        </TabsContent>
                        <TabsContent value="infoR1">
                            <R1Tab :data-to-send="dataToSend" />
                        </TabsContent>
                        <TabsContent value="r2">
                            <NoteTab :data-to-send="dataToSend" field="note_R2" label="Note R2" date-field="date_rdv_R2" />
                        </TabsContent>
                        <TabsContent value="r3">
                            <NoteTab :data-to-send="dataToSend" field="note_R3" label="Note R3" />
                        </TabsContent>
                        <TabsContent value="rdvstratégique">
                            <NoteTab
                              :data-to-send="dataToSend"
                              field="note_RDV_strategique"
                              label="Note RDV stratégique"
                              date-field="date_rdv_RDVstat"
                            />
                        </TabsContent>
                        <TabsContent value="paiements">
                            <NoteTab
                              :data-to-send="dataToSend"
                              field="note_paiements"
                              label="Date de rappel"
                              date-field="date_rdv_paiement"
                            />
                        </TabsContent>
                        <TabsContent value="montage">
                          <MontageTab
                            v-model:assigned-users="dataToSend.assigned_to_user"
                            :lead-id="lead?._id"
                          />
                        </TabsContent>
                        <TabsContent value="trello">
                          <DetailRdv :oneLead="lead">
                          </DetailRdv>
                        </TabsContent>
                    </Tabs>
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <AlertDialog>
                    <AlertDialogTrigger as-child>
                        <Button variant="outline" @click="validateAndSubmit()">
                            Soumettre
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader class="flex items-center space-x-2">
                            <AlertDialogTitle>
                                <Icon name="lucide:alert-octagon" :size="40" class="text-yellow-500" />
                            </AlertDialogTitle>
                            <AlertDialogDescription v-if="numberOfMissingFields === 0" class="text-dark-500">
                                Êtes-vous sûr(e) de vouloir valider
                            </AlertDialogDescription>

                            <AlertDialogDescription v-else class="text-dark-500">
                                Êtes-vous sûr(e) de vouloir valider car il y a {{ numberOfMissingFields }} champs manquants
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter class="flex sm:justify-center">
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction>
                                <Button @click="sendData(lead?._id)">
                                    <Loader v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                                    Continuer
                                </Button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { useVuelidate } from '@vuelidate/core';
import { useFormatDateTime } from '~/composables/formatData';
import { useAuthStore } from '~/stores/auth';
import { useLeadsStore } from '~/stores/leads';
import type { LeadInfo } from '~/stores/leads';
import { rules } from '../helpers/rules';
import GeneralInfoTab from './tabs/GeneralInfoTab.vue';
import R1Tab from './tabs/R1Tab.vue';
import NoteTab from './tabs/NoteTab.vue';
import DetailRdv from './tabs/detailRdv.vue';
import MontageTab from './tabs/MontageTab.vue';
import { LEAD_STATUS_OPTIONS, normalizeLeadStatus, type LeadStatusValue } from '~/constants/lead-statuses';
import { RDV_TYPE_OPTIONS } from '~/constants/rdvTypes';

const { addInfoLead, getLeadsByUser } = useLeadsStore();
const { userConnected } = storeToRefs(useAuthStore());
const { loading } = storeToRefs(useLeadsStore());
const { formatDateTime } = useFormatDateTime();

const props = defineProps<{
    open: boolean,
    lead: Record<string, any> | null
}>()
const emit = defineEmits(['update:open', 'update-lead'])
const open = computed({
    get: () => props.open,
    set: (val) => emit('update:open',val)
})

const appointmentDate = computed(() => {
  const rawDate = props.lead?.date_rdv
  if (!rawDate) return null

  const parsedDate = new Date(rawDate)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
})

const isAppointmentPast = computed(() => {
  if (!appointmentDate.value) return false
  return appointmentDate.value.getTime() < Date.now()
})

const formattedAppointmentDate = computed(() => {
  const rawDate = props.lead?.date_rdv
  if (!appointmentDate.value || !rawDate) return ''

  return formatDateTime(rawDate)
})

const appointmentBadgeText = computed(() => {
  if (!formattedAppointmentDate.value) return ''

  return isAppointmentPast.value
    ? `RDV planifié : ${formattedAppointmentDate.value} (passé)`
    : `Prochain RDV : ${formattedAppointmentDate.value}`
})

const appointmentBadgeClasses = computed(() => [
  'flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border shadow-sm',
  isAppointmentPast.value
    ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700'
    : 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/40'
])

const appointmentBadgeIcon = computed(() =>
  isAppointmentPast.value ? 'lucide:calendar-x' : 'lucide:calendar-check'
)

const dynamicTabs = ref([
  { label: 'Informations générales', value: 'info' },
  { label: 'Trello', value: 'trello' },
  { label: 'R1', value: 'infoR1' },
])

const tabOptions = ['Montage', 'R2', 'R3', 'RDV stratégique', 'Paiements']

const selectedTab = ref(dynamicTabs.value[0].value)
const addTab = (option: any) => {
  const value = option.toLowerCase().replace(/\s+/g, '')
  if(dynamicTabs.value.find(tab => tab.value === value)) return
  dynamicTabs.value.push({
    label: option,
    value
  })
  selectedTab.value = value
}

const closeTab = (tabId: string)  =>{
  const index = dynamicTabs.value.findIndex(tab => tab.value === tabId)
  if (index !== -1) {
    dynamicTabs.value.splice(index, 1)
    if (selectedTab.value === tabId) {
      selectedTab.value = dynamicTabs.value[0]?.value ?? ''
    }
  }
}

const dataToSend = ref<Record<string, any>>({})
const originalData = ref<Record<string, any>>({})
const originalStatus = ref<string>('')
const statusSelections = ref<Record<LeadStatusValue, boolean>>({} as Record<LeadStatusValue, boolean>)
const statusDates = ref<Record<LeadStatusValue, Date | null>>({} as Record<LeadStatusValue, Date | null>)
const rdvOccurrences = ref<(Date | null)[]>([])

const normalizeAssignedUserIds = (value: unknown): string[] => {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry
        }
        if (entry && typeof entry === 'object' && '_id' in entry && typeof (entry as any)._id === 'string') {
          return (entry as any)._id
        }
        return null
      })
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
  }

  if (typeof value === 'string') {
    return value ? [value] : []
  }

  if (value && typeof value === 'object' && '_id' in value && typeof (value as any)._id === 'string') {
    return [(value as any)._id]
  }

  return []
}

const createEditableLead = (lead: Record<string, any>) => {
  const clonedLead = JSON.parse(JSON.stringify(lead))
  clonedLead.assigned_to_user = normalizeAssignedUserIds(lead?.assigned_to_user)
  return clonedLead
}

const statusOptions = LEAD_STATUS_OPTIONS

const baseNonClosableTabs = new Set(['info', 'infoR1', 'trello'])

const tabValueToFieldMap: Partial<Record<string, keyof LeadInfo>> = {
  r2: 'note_R2',
  r3: 'note_R3',
  rdvstratégique: 'note_RDV_strategique',
  paiements: 'note_paiements',
}

const isValueFilled = (value: unknown) => value !== null && value !== undefined && value !== ''

const normalizeStatusName = (name: string | null | undefined): LeadStatusValue | null =>
  normalizeLeadStatus(typeof name === 'string' ? name : null)

const syncStatusesToData = () => {
  const statusesPayload = statusOptions
    .flatMap((option) => {
      const isChecked = statusSelections.value?.[option.value]
      if (!isChecked) {
        return []
      }

      if (option.value === 'RDV') {
        const parsedOccurrences = rdvOccurrences.value
          .map((occurrence) => (occurrence instanceof Date ? occurrence : (occurrence ? new Date(occurrence) : null)))
          .filter((occurrence): occurrence is Date => occurrence !== null && occurrence !== undefined && !Number.isNaN((occurrence as Date).getTime()))

        return parsedOccurrences.map((occurrence) => ({
          name: option.value,
          date: occurrence.toISOString()
        }))
      }

      const rawDate = statusDates.value?.[option.value]
      if (!rawDate) {
        return []
      }

      const parsedDate = rawDate instanceof Date ? rawDate : new Date(rawDate)
      if (Number.isNaN(parsedDate.getTime())) {
        return []
      }

      return [{
        name: option.value,
        date: parsedDate.toISOString()
      }]
    })

  const orderedStatuses = statusesPayload
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  dataToSend.value.statuses = orderedStatuses

  if (orderedStatuses.length) {
    const latest = orderedStatuses[orderedStatuses.length - 1]
    dataToSend.value.status = latest.name
  } else if (statusSelections.value['Nouveau lead']) {
    dataToSend.value.status = 'Nouveau lead'
  } else if (!dataToSend.value.status) {
    dataToSend.value.status = 'Nouveau lead'
  }
}

const initializeStatuses = (lead: Record<string, any>) => {
  const existingStatuses = Array.isArray(lead?.statuses) ? lead.statuses : []

  const selections: Record<LeadStatusValue, boolean> = {} as Record<LeadStatusValue, boolean>
  const dates: Record<LeadStatusValue, Date | null> = {} as Record<LeadStatusValue, Date | null>

  const statusesByName = new Map<LeadStatusValue, Date[]>()

  existingStatuses.forEach((status: any) => {
    const statusName = normalizeStatusName(typeof status?.name === 'string' ? status.name : null)
    if (!statusName) {
      return
    }

    const parsedDate = status?.date ? new Date(status.date) : null
    if (!statusesByName.has(statusName)) {
      statusesByName.set(statusName, [])
    }

    if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
      statusesByName.get(statusName)?.push(parsedDate)
    }
  })

  statusesByName.forEach((datesArray) => {
    datesArray.sort((a, b) => a.getTime() - b.getTime())
  })

  statusOptions.forEach((option) => {
    const statusDatesForValue = statusesByName.get(option.value) ?? []
    selections[option.value] = statusDatesForValue.length > 0
    dates[option.value] = statusDatesForValue[0] ?? null
  })

  const normalizedLeadStatus = typeof lead?.status === 'string'
    ? normalizeStatusName(lead.status)
    : null

  if (!existingStatuses.length) {
    const createdReference = lead?.createdAt ? new Date(lead.createdAt) : new Date()
    selections['Nouveau lead'] = true
    dates['Nouveau lead'] = createdReference

    if (
      normalizedLeadStatus &&
      normalizedLeadStatus !== 'Nouveau lead' &&
      statusOptions.some((option) => option.value === normalizedLeadStatus)
    ) {
      selections[normalizedLeadStatus] = true
      dates[normalizedLeadStatus] = lead?.updatedAt ? new Date(lead.updatedAt) : new Date()
    }
  } else if (selections['Nouveau lead'] && !dates['Nouveau lead']) {
    dates['Nouveau lead'] = lead?.createdAt ? new Date(lead.createdAt) : new Date()
  }

  const rdvDates = statusesByName.get('RDV') ?? []
  if (rdvDates.length) {
    rdvOccurrences.value = [...rdvDates]
  } else if (selections['RDV']) {
    const rdvDate = dates['RDV'] ?? null
    rdvOccurrences.value = rdvDate ? [rdvDate] : []
  } else {
    rdvOccurrences.value = []
  }

  statusSelections.value = selections
  statusDates.value = dates

  syncStatusesToData()
}

const toggleStatusSelection = (name: LeadStatusValue, checked: boolean) => {
  statusSelections.value = {
    ...statusSelections.value,
    [name]: checked
  }

  if (name === 'RDV') {
    if (checked) {
      if (!rdvOccurrences.value.length) {
        rdvOccurrences.value = [new Date()]
      }

      statusDates.value = {
        ...statusDates.value,
        [name]: rdvOccurrences.value[0] ?? new Date()
      }
    } else {
      rdvOccurrences.value = []

      statusDates.value = {
        ...statusDates.value,
        [name]: null
      }
    }

    syncStatusesToData()
    return
  }

  if (checked && !statusDates.value?.[name]) {
    statusDates.value = {
      ...statusDates.value,
      [name]: new Date()
    }
  }

  if (!checked) {
    statusDates.value = {
      ...statusDates.value,
      [name]: null
    }
  }

  syncStatusesToData()
}

const updateStatusDate = (name: LeadStatusValue, date: Date | null) => {
  if (name === 'RDV') {
    const normalizedDate = date ?? null

    if (!rdvOccurrences.value.length) {
      rdvOccurrences.value = [normalizedDate]
    } else {
      rdvOccurrences.value = rdvOccurrences.value.map((occurrence, index) => (index === 0 ? normalizedDate : occurrence))
    }

    statusDates.value = {
      ...statusDates.value,
      [name]: normalizedDate
    }

    if (normalizedDate && !statusSelections.value?.[name]) {
      statusSelections.value = {
        ...statusSelections.value,
        [name]: true
      }
    }

    syncStatusesToData()
    return
  }

  statusDates.value = {
    ...statusDates.value,
    [name]: date
  }

  if (date && !statusSelections.value?.[name]) {
    statusSelections.value = {
      ...statusSelections.value,
      [name]: true
    }
  }

  syncStatusesToData()
}

const syncFirstRdvDate = () => {
  statusDates.value = {
    ...statusDates.value,
    RDV: rdvOccurrences.value[0] ?? null
  }
}

const addRdvOccurrence = () => {
  const nextDate = new Date()
  rdvOccurrences.value = [...rdvOccurrences.value, nextDate]

  if (!statusSelections.value?.RDV) {
    statusSelections.value = {
      ...statusSelections.value,
      RDV: true
    }
  }

  syncFirstRdvDate()
  syncStatusesToData()
}

const removeRdvOccurrence = (index: number) => {
  if (index <= 0 || index >= rdvOccurrences.value.length) {
    return
  }

  rdvOccurrences.value = rdvOccurrences.value.filter((_, idx) => idx !== index)
  syncFirstRdvDate()
  syncStatusesToData()
}

const updateRdvOccurrence = (index: number, date: Date | null) => {
  if (index < 0 || index >= rdvOccurrences.value.length) {
    return
  }

  const normalizedDate = date ?? null
  rdvOccurrences.value = rdvOccurrences.value.map((occurrence, idx) => (idx === index ? normalizedDate : occurrence))
  syncFirstRdvDate()

  if (normalizedDate && !statusSelections.value?.RDV) {
    statusSelections.value = {
      ...statusSelections.value,
      RDV: true
    }
  }

  syncStatusesToData()
}


const isCloseButtonVisible = (tabValue: string) => {
  if (baseNonClosableTabs.has(tabValue)) {
    return false
  }

  const field = tabValueToFieldMap[tabValue]

  if (field) {
    const fieldValue = dataToSend.value?.[field]
    if (isValueFilled(fieldValue)) {
      return false
    }
    console.log(fieldValue,'fieldValue')
  }

  return true
}

watch(
  () => props.lead,
  (newLead) => {
    if (newLead) {
      const editableLead = createEditableLead(newLead)
      dataToSend.value = editableLead
      originalData.value = JSON.parse(JSON.stringify(editableLead))
      originalStatus.value = newLead.status
      initializeStatuses(newLead)
    }
  },
  { immediate: true }
)

watch(
  () => dataToSend.value.assigned_to_user,
  (value) => {
    if (!Array.isArray(value)) {
      dataToSend.value.assigned_to_user = normalizeAssignedUserIds(value)
    }
  },
  { immediate: true }
)

const rdvTypeOptions = ref([...RDV_TYPE_OPTIONS])

const v$ = useVuelidate(rules, dataToSend as any)
const validateAndSubmit = async () => {
    v$.value.$touch()
    if (v$.value.$invalid) {
        return
    }
}
const sendData = async (leadId: string) => {
    try {
        syncStatusesToData()

        const changes: Record<string, any> = {}
        const excluded = new Set(['_id', 'id_lead', 'created_time', 'full_name', '__v', 'createdAt', 'updatedAt', 'detailrdv', 'statuses'])
        Object.keys(dataToSend.value).forEach(key => {
            if (!excluded.has(key) && dataToSend.value[key] !== originalData.value[key]) {
                changes[key] = dataToSend.value[key]
            }
        })

        const currentStatuses = Array.isArray(dataToSend.value.statuses) ? dataToSend.value.statuses : []
        const previousStatuses = Array.isArray(originalData.value.statuses) ? originalData.value.statuses : []
        const statusesChanged = JSON.stringify(currentStatuses) !== JSON.stringify(previousStatuses)

        let hasUpdates = false

        if (Object.keys(changes).length) {
            await addInfoLead(leadId, changes)
            hasUpdates = true
            if (changes.status && ['Paiement', 'Devis'].includes(changes.status) && changes.status !== originalStatus.value) {
                await $fetch('/api/transactions', {
                    method: 'POST',
                    body: {
                        lead: leadId,
                        type: changes.status
                    }
                })
            }
        }

        if (statusesChanged) {
            await $fetch('/api/leadMeta/manage/statuses', {
                method: 'POST',
                body: {
                    id_lead: leadId,
                    statuses: currentStatuses
                }
            })
            hasUpdates = true
        }

        if (hasUpdates) {
            originalData.value = JSON.parse(JSON.stringify(dataToSend.value))
            originalStatus.value = dataToSend.value.status
        }

        open.value = !open.value
        await getLeadsByUser(userConnected.value._id);
    } catch (error) {
        console.error('Erreur lors de l\'envoi des données :', error)
    }
}

const allFieldsToCheck = [
  'nom',
  'prenom',
  'email',
  'phone_number',
  'objectif_client',
  'nom_societe',
  'localisation_societe',
  'panier',
  'chiffre_affaire',
  'fonction',
  'domaine',
  'date_creation',
  'produit_vendu',
  'lieu_vente',
  'resultat_net',
  'taille_entreprise',
  'tarif_prestation',
  'type_lieu_rdv',
  'date_rdv',
  'canaux_marketing',
  'commentaire',
  'status',
  'note_R1',
  'note_R2',
  'note_R3',
  'note_RDV_strategique',
  'note_paiement'
]

const numberOfMissingFields = computed(() => {
  const excluded = new Set([
    'note_R1', 'note_R2', 'note_R3', 'note_RDV_strategique', 'note_paiement'
  ])

  const socialFields = [
    'lien_fb', 'lien_insta', 'lien_tiktok', 'lien_linkedin', 'lien_siteweb'
  ]

  const isEmpty = (val: any) =>
    val === null || val === undefined || (typeof val === 'string' && val.trim() === '')

  const allSocialFieldsEmpty = socialFields.every(field => {
    const value = dataToSend.value[field]
    return isEmpty(value)
  })

  const missing = allFieldsToCheck.filter(key => {
    if (excluded.has(key)) return false
    if (socialFields.includes(key)) return false

    return isEmpty(dataToSend.value[key])
  })
  console.log(missing,'missing ')

  return allFieldsToCheck.filter(key => {
    if (excluded.has(key)) return false
    if (socialFields.includes(key)) return false

    return isEmpty(dataToSend.value[key])
  }).length
  + (allSocialFieldsEmpty ? 1 : 0)
})

const tabMap = {
  note_R2: 'R2',
  note_R3: 'R3',
  note_RDV_strategique: 'RDV stratégique',
  note_paiements: 'Paiements',
}

function updateDynamicTabs() {
  const baseTabs = [
    { label: 'Informations générales', value: 'info' },
    { label: 'Trello', value: 'trello'},
    { label: 'R1', value: 'infoR1' },
  ]

  const dynamicNoteTabs = Object.entries(tabMap)
    .filter(([key]) => dataToSend.value[key as keyof LeadInfo] !== null && dataToSend.value[key as keyof LeadInfo] !== undefined && dataToSend.value[key as keyof LeadInfo] !== '')
    .map(([key, label]) => ({
      label,
      value: label.toLowerCase().replace(/\s+/g, '')
    }))

  const preservedCustomTabs = dynamicTabs.value.filter((tab) => {
    const isBaseTab = baseTabs.some((baseTab) => baseTab.value === tab.value)
    const isDynamicNoteTab = dynamicNoteTabs.some((noteTab) => noteTab.value === tab.value)

    return !isBaseTab && !isDynamicNoteTab
  })

  dynamicTabs.value = [...baseTabs, ...preservedCustomTabs, ...dynamicNoteTabs]
}

updateDynamicTabs()

watchEffect(() => {
  updateDynamicTabs()
})
</script>

<style>
.DialogContent {
  width: 144%!important;
}

.error-input {
  border: 1px solid red;
  border-radius: 7px;
}

.dp__input{
  height: 36px!important;
  border-radius: 7px!important;
}
.vue-tel-input{
    height: 35px;
    border-radius: 7px;
    border: 1px solid #d1d5db;
}

label{
    color:#818181
}

html.dark label{
    color:#969696
}
</style>
