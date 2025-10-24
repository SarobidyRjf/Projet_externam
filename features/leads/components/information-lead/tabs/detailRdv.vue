<template>
    <div class="-mx-6 flex flex-wrap border border-t-1 border-l-0 border-r-0 border-b-1 h-[500px]">
        <div class="p-6 w-64 flex-auto border border-r-1 border-l-0 border-t-0 border-b-0">
            <h1 class="text-lg text-gray-900 dark:text-white">Fonctionnalité</h1>
            <div class="flex flex-row flex-wrap gap-2" @click.stop>
            </div>
            <div class="flex flex-row flex-wrap gap-2" @click.stop>
                <Popover v-for="subMenu in subMenus"
                    :key="subMenu.label"
                    @update:open="handlePopoverOpenChange($event, subMenu)" 
                    v-model:open="openPopover[subMenu.value]">
                    <PopoverTrigger>
                        <Button 
                            variant="outline" 
                            @click="handleActiveSubmenu(subMenu)" 
                            :class="{ active : subMenu.value === activeSubMenu }" 
                            class="cursor-pointer px-3 border rounded-sm">
                                <Icon :name="subMenu.icon" class="" />
                                    {{ subMenu.label }}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div class="test">
                            <component
                              v-if="subMenu.component && subMenu.value === activeSubMenu"
                              :is="subMenu.component"
                              :leadId="props.oneLead?._id"
                              :daterappel="rdvDetailed?.date_rdv_rappel"
                              :reminders="reminderMinutes"
                              @closePopover="openPopover[subMenu.value] = false"
                            />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div :class="{ 'overflow-y-scroll h-[370px]': rdvDetailed }">
                <div v-if="rdvDetailed?.membres?.length">
                <p class="text-[12px] mt-2 font-semibold">Membres :</p>
                <div  class="flex flex-wrap gap-2 mt-2">
                    <div v-for="membre in rdvDetailed.membres" :key="membre._id" variant="secondary">
                        <Avatar class="cursor-pointer">
                            <AvatarImage src="" />
                            <AvatarFallback class="bg-[#02afc7] text-black">
                               
                                <HoverCard class="mt-4" :open-delay="20" :close-delay="20">
                                    <HoverCardTrigger> {{ getInitials(membre.nom, membre.prenom) }}</HoverCardTrigger>
                                    <HoverCardContent class="w-fit">
                                        {{ membre.nom }} {{ membre.prenom }}
                                    </HoverCardContent>
                                </HoverCard>
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>

            <div v-if="rdvDetailed?.piece_jointe" class="mt-4 space-y-2">
                <div v-if="rdvDetailed.piece_jointe.docs_societe">
                    <p class="text-[12px] font-semibold">Docs société :</p>
                    <div v-for="(file, key) in rdvDetailed.piece_jointe.docs_societe" :key="key" class="flex items-center gap-2">
                        <span class="capitalize">{{ key }} :</span>
                        <a :href="file" target="_blank" class="text-blue-600 underline">
                            {{ file.split('/').pop() }}
                        </a>
                        <Icon name="lucide:circle-minus" class="cursor-pointer" @click="deletePieceJointe(props.oneLead?._id, 'docs_societe', key)" />
                    </div>
                </div>
                <div v-if="rdvDetailed.piece_jointe.contrat?.length">
                    <p class="text-[12px] font-semibold">Contrat :</p>
                    <div v-for="(file, index) in rdvDetailed.piece_jointe.contrat" :key="index" class="flex items-center gap-2">
                        <a :href="file" target="_blank" class="text-blue-600 underline">
                            {{ file.split('/').pop() }}
                        </a>
                        <Icon name="lucide:circle-minus" class="cursor-pointer" @click="deletePieceJointe(props.oneLead?._id, 'contrat', index)" />
                    </div>
                </div>
                <div v-if="rdvDetailed.piece_jointe.facture?.length">
                    <p class="text-[12px] font-semibold">Facture :</p>
                    <div v-for="(file, index) in rdvDetailed.piece_jointe.facture" :key="index" class="flex items-center gap-2">
                        <a :href="file" target="_blank" class="text-blue-600 underline">
                            {{ file.split('/').pop() }}
                        </a>
                        <Icon name="lucide:circle-minus" class="cursor-pointer" @click="deletePieceJointe(props.oneLead?._id, 'facture', index)" />
                    </div>
                </div>
                <div v-if="rdvDetailed.piece_jointe.autre?.length">
                    <p class="text-[12px] font-semibold">Autre :</p>
                    <div v-for="(file, index) in rdvDetailed.piece_jointe.autre" :key="index" class="flex items-center gap-2">
                        <a :href="file" target="_blank" class="text-blue-600 underline">
                            {{ file.split('/').pop() }}
                        </a>
                        <Icon name="lucide:circle-minus" class="cursor-pointer" @click="deletePieceJointe(props.oneLead?._id, 'autre', index)" />
                    </div>
                </div>
            </div>
            
            
            <div v-if="rdvDetailed?.niveau_prospect">
                <div :class="{
                        'bg-green-400 text-green-900': rdvDetailed?.niveau_prospect === 3,
                        'bg-yellow-400 text-yellow-900': rdvDetailed?.niveau_prospect === 2,
                        'bg-red-400 text-red-900': rdvDetailed?.niveau_prospect === 1
                    }" 
                    class="px-4 py-1 mt-4 rounded-[4px] w-fit font-semibold text-white">
                    Prospect niveau {{ rdvDetailed?.niveau_prospect }}
                </div>
            </div>

            <div class="mt-4">
                <div v-if="rdvDetailed?.date_rdv_rappel">
                    <Label>Date rappel</Label>
                    <Badge class="px-4 py-1 mt-2" variant="secondary">
                        {{ formatDateTime(rdvDetailed?.date_rdv_rappel ?? "") }}
                        <Badge v-show="statutRappel ==='En retard'" class="ml-2 border rounded-[4px] bg-red-600">
                            {{ statutRappel }}
                        </Badge>
                        <Badge v-show="statutRappel ==='Dû prochainement'" class="ml-2 border text-dark rounded-[4px] bg-[#e2b203]">
                            {{ statutRappel }}
                        </Badge>
                    </Badge>
                    <div v-if="reminderDetails.length" class="mt-3 space-y-2">
                        <Label>Rappels programmés</Label>
                        <div class="flex flex-col gap-2">
                            <div
                                v-for="reminder in reminderDetails"
                                :key="reminder.minutes"
                                class="flex flex-col rounded-md border border-dashed px-3 py-2 text-xs md:flex-row md:items-center md:justify-between"
                            >
                                <span class="font-medium">{{ reminder.label }}</span>
                                <span class="text-muted-foreground md:text-right">{{ reminder.formattedDate }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4" v-for="(opt,i) in rdvDetailed?.checklist" :key="i">
                    <div class="flex justify-between items-center mb-2" >
                        <div class="flex flex-col">
                            <div class="flex flex-row items-center">
                                <Icon name="lucide:square-check-big" class="mr-2 text-gray-900" />
                                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ opt.title }}</p>
                            </div>
                        </div>
                        <Button  variant="secondary" class="py-1" @click="removeChecklist(props.oneLead?.id_lead, i)">
                            <span>Supprimer</span>
                        </Button>
                    </div>
                        <div class="flex flex-row items-center">
                            <span>{{ getProgress(opt) }}%</span>
                            <Progress :model-value="getProgress(opt)" class="w-full h-[5px] ml-4 text-red-400" />
                        </div>
                        <div class="flex flex-col ml-4 mt-2">
                            <div class="flex items-center gap-2 mb-2" v-for="(item, index) in opt.items" :key="index">
                                <Checkbox
                                    class="text-gray-900"
                                    v-model="item.done" 
                                    @update:modelValue="() => finishedTask(props.oneLead?._id, i, index)"
                                />
                                <p :class="{ 'line-through': item.done }" class="flex-1 flex items-center px-[8px] py-[4px] rounded-[5px] justify-between hover:bg-gray-100">{{ item.label }}
                                    <Icon name="lucide:circle-minus" class=" cursor-pointer" @click="removeItem(props.oneLead?.id_lead, i, index)" />
                                </p>
                                
                            </div>
                        </div>
                        <form @submit.prevent="ajoutItemChecklist(props.oneLead?._id, i)" class="gap-2 flex flex-col ml-2">
                            <Input v-model="newItems[i]" type="text" class="w-full" placeholder="Ajouter un élément" />
                            <Button
                                :disabled="checklistItemLoading[i]"
                                type="submit"
                                class="bg-blue-700 hover:bg-blue-800 rounded-[5px] w-fit"
                            >
                                <Loader2 v-if="checklistItemLoading[i]" class="h-4 w-4 animate-spin" />
                                <span>{{ checklistItemLoading[i] ? 'Ajouter' : 'Ajouter' }}</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <div class="text-lg p-6 w-32 flex-auto">
            <p class="mb-4 text-gray-900 dark:text-white">Commentaires et activité</p>
            <!-- <pre>{{ history }}</pre> -->
            <div v-if="history.length" class="space-y-3 overflow-y-auto h-[390px] pr-2">
                <div v-for="item in history" :key="item._id" class="text-sm">
                    <div class="flex flex-row items-start gap-2">
                        <Avatar class="cursor-pointer">
                            <AvatarImage src="" />
                            <AvatarFallback class="bg-[#02afc7] text-black">
                                        {{ getInitials(item.user?.nom ?? '', item.user?.prenom ?? '') }}
                            </AvatarFallback>
                        </Avatar>
                        <div class="text-gray-800 dark:text-gray-200">
                            <span class="font-semibold">{{ item.user?.nom }} {{ item.user?.prenom }}</span> {{ item.action }}
                            <div class="text-xs text-gray-500 flex items-center gap-2">
                                - {{ formatDateTime(item.createdAt) }}
                                <Button
                                    v-if="item.meta?.fields?.length"
                                    variant="link"
                                    class="h-auto p-0 text-xs"
                                    @click="toggleDetails(item._id)"
                                >
                                    {{ openDetails[item._id] ? 'Voir moins' : 'Voir plus' }}
                                </Button>
                            </div>
                            <div
                                v-if="openDetails[item._id]"
                                class="mt-1 text-xs text-gray-600 dark:text-gray-400"
                            >
                                <div v-if="item.meta?.fields?.length">
                                    Colonnes modifiées : {{ item.meta.fields.join(', ') }}
                                </div>
                                <div v-else>
                                    Aucun détail disponible.
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div v-else class="text-sm text-gray-500">Aucune activité.</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Progress } from '@/components/ui/progress'
import dateRapel from "./subMenus/dateRapel.vue"
import etiquette from "./subMenus/etiquette.vue"
import checklist from "./subMenus/checklist.vue"
import membre from "./subMenus/membre.vue"
import pieceJointe from "./subMenus/pieceJointe.vue"
import { useDetailedRdv } from "~/stores/leads/detailedRdv"
import { useFormatDateTime, useFormatName } from '@/composables/formatData';
import { useLeadHistory } from '~/stores/leads/history'
import { useReminderNotifications } from '@/composables/useReminderNotifications'
import type { ReminderNotification } from '@/composables/useReminderNotifications'
import { formatReminderDuration } from '@/lib/reminders'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Loader2 } from "lucide-vue-next"
import { storeToRefs } from 'pinia'

const { formatDateTime } = useFormatDateTime()
const { getInitials } = useFormatName()

const detailedRdvStore = useDetailedRdv()
const { getDetailedRdv, addItemChecklist, toggleItemChecklist, deleteChecklist, deleteItemChecklist, deletePieceJointe } = detailedRdvStore
const { rdvDetailed } = storeToRefs(detailedRdvStore)
const historyStore = useLeadHistory()
const { history } = storeToRefs(historyStore)


const props = defineProps<{
    oneLead: Record<string, any> | null
}>()

const openPopover = ref<Record<string, boolean>>({})
const openDetails = ref<Record<string, boolean>>({})

const toggleDetails = (id: string) => {
    openDetails.value[id] = !openDetails.value[id]
}

const getOneDetailedRdv = async(idLead: string) => {
    await getDetailedRdv(idLead)
    await historyStore.fetchHistory(idLead)
}

const finishedTask = async (idLead: string, checklistIndex: number, itemIndex: number) => {
    console.log('test')
    await toggleItemChecklist( idLead, checklistIndex, itemIndex)
}

const removeChecklist = async (idLead: string, checklistIndex: number) => {
    await deleteChecklist(idLead, checklistIndex)
}

const removeItem = async (idLead: string, checklistIndex: number, itemIndex: number) => {
    await deleteItemChecklist(idLead, checklistIndex, itemIndex)
}

const activeSubMenu = ref(null)
const newItems = ref<string[]>([])
const checklistItemLoading = ref<Record<number, boolean>>({})

const ajoutItemChecklist = async (idLead: string | undefined, indexChecklist: number) => {
    const itemLabel = newItems.value[indexChecklist]
    if (!itemLabel || !idLead) return
    checklistItemLoading.value[indexChecklist] = true
    try {
        await addItemChecklist(idLead, indexChecklist, itemLabel)
        newItems.value[indexChecklist] = ""
        await getDetailedRdv(idLead)
    } finally {
            checklistItemLoading.value[indexChecklist] = false
    }
}

const getProgress = (checklist: any) => {
  if (!checklist.items.length) return 0
  const doneCount = checklist.items.filter((i: any) => i.done).length
  return Math.round((doneCount / checklist.items.length) * 100)
}

const subMenus = ref([
    { label: 'Etiquette', value: 'etiquettes', icon: 'lucide:tag', component: etiquette },
    { label: 'Date de rappel', value: 'dates', icon: 'lucide:calendar', component: dateRapel },
    { label: 'Checklist', value: 'checklist', icon: 'lucide:check', component: checklist },
    { label: 'Membres', value: 'membres', icon: 'lucide:user-round-plus', component: membre },
    { label: 'Pièce jointe', value: 'pieceJointe', icon: 'lucide:paperclip', component: pieceJointe },

])
const handleActiveSubmenu = (subMenu: any) => {
  activeSubMenu.value = activeSubMenu.value === subMenu.value ? null : subMenu.value;
};
const handlePopoverOpenChange = (isOpen: boolean, subMenu: any) => {
  if (!isOpen && activeSubMenu.value === subMenu.value) {
    activeSubMenu.value = null;
  }
};
onMounted(async() => {
    if (props.oneLead?._id) {
        resetReminderNotifications()
        await getOneDetailedRdv(props.oneLead._id)
    }
})
watch(()=> props.oneLead?._id, async(newLead, oldLead) => {
    if (newLead) {
        if (newLead !== oldLead) {
            resetReminderNotifications()
        }
        await getOneDetailedRdv(newLead)
    } else {
        rdvDetailed.value = null
        historyStore.history = []
    }
})

const rappelRetard = ref("")
const rappelProchainement = ref("")

const { scheduleReminders, reset: resetReminderNotifications } = useReminderNotifications()

const reminderMinutes = computed(() => {
  if (!rdvDetailed.value) return []
  const rawValues = rdvDetailed.value.reminders && rdvDetailed.value.reminders.length
    ? rdvDetailed.value.reminders
    : (typeof rdvDetailed.value?.reminder === 'number' && rdvDetailed.value.reminder >= 0
      ? [rdvDetailed.value.reminder]
      : [])

  return [...new Set(rawValues
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0))]
    .sort((a, b) => a - b)
})

const reminderMoments = computed(() => {
  if (!rdvDetailed.value?.date_rdv_rappel) return []
  const dateRDV = new Date(rdvDetailed.value.date_rdv_rappel)
  return reminderMinutes.value.map((minutes) => new Date(dateRDV.getTime() - minutes * 60 * 1000))
    .sort((a, b) => a.getTime() - b.getTime())
})

const reminderDetails = computed(() => {
  if (!rdvDetailed.value?.date_rdv_rappel) return []
  const dateRDV = new Date(rdvDetailed.value.date_rdv_rappel)

  return reminderMinutes.value.map((minutes) => {
    const reminderDate = new Date(dateRDV.getTime() - minutes * 60 * 1000)
    return {
      minutes,
      label: formatReminderDuration(minutes),
      formattedDate: formatDateTime(reminderDate.toISOString())
    }
  })
})

const statutRappel = computed(() => {
  if (!rdvDetailed.value?.date_rdv_rappel || !reminderMinutes.value.length) return ""

  const maintenant = new Date()
  const prochaineEcheance = reminderMoments.value.find((date) => date >= maintenant)

  if (prochaineEcheance) {
    rappelProchainement.value = "Dû prochainement"
    rappelRetard.value = ""
    return rappelProchainement.value
  }

  rappelRetard.value = "En retard"
  rappelProchainement.value = ""
  return rappelRetard.value
})

const leadDisplayName = computed(() => {
  if (!props.oneLead) return undefined

  if (props.oneLead.full_name) {
    return props.oneLead.full_name
  }

  const parts = [props.oneLead.nom, props.oneLead.prenom].filter((value) => Boolean(value && String(value).trim()))
  const label = parts.join(' ').trim()

  return label.length ? label : undefined
})

watchEffect(() => {
  if (!rdvDetailed.value) {
    return
  }

  if (!reminderMoments.value.length || !rdvDetailed.value?.date_rdv_rappel) {
    scheduleReminders([])
    return
  }

  const reminders = reminderMinutes.value.reduce<ReminderNotification[]>((acc, minutes, index) => {
    const date = reminderMoments.value[index]
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return acc
    }

    if (!Number.isFinite(minutes)) {
      return acc
    }

    const reminder: ReminderNotification = {
      date,
      minutes,
      ...(leadDisplayName.value ? { leadName: leadDisplayName.value } : {})
    }

    acc.push(reminder)
    return acc
  }, [])

  scheduleReminders(reminders)
})



defineExpose({
    idLead : props.oneLead?._id
})

</script>

<style scoped>
.active {
    background-color: #000000;
    color: #fff;
}

html.dark .active {
    background-color: #fff;
    color: #000000;
}
</style>
