<template>
    <form class="date-rappel  space-y-4" @submit.prevent="saveDateRappel(props.leadId)">
        <h1 class="text-center text-[14px] font-semibold">Date de rappel</h1>
        <VueDatePicker
            :enable-time-picker="true"
            locale="fr-FR"
            format="dd/MM/yyyy"
            cancel-text="Retour"
            select-text="Sélectionner"
            placeholder="--/--/----"
            :inline="true"
            :append-to-body="false"
            v-model="datetime"
            auto-apply
            :popover="{ class: 'custom-datepicker' }"
        />

        <div class="space-y-3">
            <div>
                <Label class="text-sm font-semibold">
                    <Icon name="lucide:bell-ring" class=" size-4" />
                    Rappels rapides
                </Label>
                <p class="mt-1 text-xs text-muted-foreground">
                    Choisissez un ou plusieurs rappels à envoyer avant le rendez-vous.
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                    <Button
                        v-for="option in reminderOptions"
                        :key="option.value"
                        type="button"
                        variant="outline"
                        size="sm"
                        class="rounded-full border-dashed"
                        :class="{
                            'border-primary bg-primary/10 text-primary hover:bg-primary/20': isReminderSelected(option.value)
                        }"
                        @click="toggleReminder(option.value)"
                    >
                        {{ option.label }}
                    </Button>
                </div>
            </div>

            <div class="space-y-2">
                <Label class="text-sm font-semibold">
                    <Icon name="lucide:clock" class=" size-4" />
                    Ajouter un rappel personnalisé
                </Label>
                <div class="flex flex-row gap-2 sm:flex-row">
                    <div class="flex flex-1 flex-col gap-1 sm:flex-row">
                        <Input
                            v-model.number="customReminderValue"
                            type="number"
                            min="1"
                            placeholder="Nombre"
                            class="flex-1"
                        />
                        <Select v-model="customReminderUnit">
                            <SelectTrigger class="sm:w-[160px]">
                                <SelectValue placeholder="Unité" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Heures</SelectItem>
                                <SelectItem value="days">Jours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        class="shrink-0"
                        @click="addCustomReminder"
                        :disabled="!customReminderValue"
                    >
                        <Icon name="lucide:plus" class="h-4 w-4" />
                    </Button>
                </div>
                <p class="text-xs text-muted-foreground">
                    Les rappels seront envoyés à tous les membres et les observateurs de cette carte.
                </p>
            </div>

            <div v-if="displayedReminders.length" class="space-y-2">
                <Label class="text-sm font-semibold">Rappels sélectionnés</Label>
                <div class="flex flex-wrap gap-2">
                    <Badge
                        v-for="reminder in displayedReminders"
                        :key="reminder.value"
                        variant="secondary"
                        class="flex items-center gap-2 rounded-full"
                    >
                        <span>{{ reminder.label }}</span>
                        <Icon
                            name="lucide:x"
                            class="h-3 w-3 cursor-pointer"
                            @click.stop="removeReminder(reminder.value)"
                        />
                    </Badge>
                </div>
            </div>
            <div v-else class="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                Aucun rappel sélectionné. Ajoutez des rappels pour être prévenu avant le rendez-vous.
            </div>

            <div class="flex flex-col">
                <Button :disabled="loading || !datetime" type="submit" variant="secondary" class="mt-2 mb-2">
                    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
                    <span>{{ loading ? 'Enregistrement...' : 'Enregistrer' }}</span>
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    class="mb-2"
                    @click="clearReminders"
                    :disabled="!selectedReminders.length"
                >
                    Supprimer les rappels
                </Button>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useDetailedRdv } from "~/stores/leads/detailedRdv"
import { Loader2 } from "lucide-vue-next"

const detailedRdvStore = useDetailedRdv()
const { addDateRappel, getDetailedRdv } = detailedRdvStore
const { loading, rdvDetailed } = storeToRefs(detailedRdvStore)

const datetime = ref<Date | null>(null)
const selectedReminders = ref<number[]>([])
const customReminderValue = ref<number | undefined>(undefined)
const customReminderUnit = ref<'minutes' | 'hours' | 'days'>('minutes')

const props = defineProps<{
    daterappel?: string | Date | null
    reminders?: number[]
    leadId: string
}>()

const emit = defineEmits(['update:daterappel', 'closePopover'])

const reminderOptions = ref([
    { label: '10 min', value: 10 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 h', value: 60 },
    { label: '2 h', value: 120 },
    { label: '1 jour', value: 1440 },
    { label: '2 jours', value: 2880 },
    { label: '1 semaine', value: 10080 },
])

const normalizeReminders = (values: Array<number | string | null | undefined>) => {
    return [...new Set(values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value >= 0))]
        .sort((a, b) => a - b)
}

const hydrateFromStore = () => {
    const sourceDate = rdvDetailed.value?.date_rdv_rappel ?? props.daterappel ?? null
    datetime.value = sourceDate ? new Date(sourceDate) : null

    const storeReminders = rdvDetailed.value?.reminders && rdvDetailed.value.reminders.length
        ? rdvDetailed.value.reminders
        : (typeof rdvDetailed.value?.reminder === 'number' && rdvDetailed.value.reminder > 0
            ? [rdvDetailed.value.reminder]
            : props.reminders ?? [])

    selectedReminders.value = normalizeReminders(storeReminders)
}

watch(() => rdvDetailed.value, hydrateFromStore, { immediate: true })

watch(() => props.daterappel, (newDate) => {
    if (!rdvDetailed.value?.date_rdv_rappel) {
        datetime.value = newDate ? new Date(newDate) : null
    }
})

watch(
    () => props.reminders,
    (newReminders) => {
        if (!rdvDetailed.value?.reminders?.length) {
            selectedReminders.value = normalizeReminders(newReminders ?? [])
        }
    },
    { deep: true }
)

const toggleReminder = (value: number) => {
    if (isReminderSelected(value)) {
        selectedReminders.value = selectedReminders.value.filter((item) => item !== value)
    } else {
        selectedReminders.value = normalizeReminders([...selectedReminders.value, value])
    }
}

const isReminderSelected = (value: number) => selectedReminders.value.includes(value)

const addCustomReminder = () => {
    if (!customReminderValue.value || customReminderValue.value <= 0) return

    const multiplier = {
        minutes: 1,
        hours: 60,
        days: 1440
    } as const

    const minutes = Math.round(customReminderValue.value * multiplier[customReminderUnit.value])
    if (!minutes) return

    selectedReminders.value = normalizeReminders([...selectedReminders.value, minutes])
    customReminderValue.value = undefined
}

const removeReminder = (value: number) => {
    selectedReminders.value = selectedReminders.value.filter((item) => item !== value)
}

const clearReminders = () => {
    selectedReminders.value = []
}

const formatReminderLabel = (minutes: number) => {
    if (minutes === 0) return "À l'heure du rendez-vous"

    const days = Math.floor(minutes / 1440)
    const hours = Math.floor((minutes % 1440) / 60)
    const mins = minutes % 60

    const parts: string[] = []
    if (days) parts.push(`${days} jour${days > 1 ? 's' : ''}`)
    if (hours) parts.push(`${hours} h`)
    if (mins) parts.push(`${mins} min`)

    return `${parts.join(' ')} avant`
}

const formatReminderTime = (minutes: number) => {
    if (!datetime.value) return null
    const reminderDate = new Date(datetime.value.getTime() - minutes * 60 * 1000)
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(reminderDate)
}

const displayedReminders = computed(() => {
    return selectedReminders.value.map((value) => {
        const baseLabel = formatReminderLabel(value)
        const reminderTime = formatReminderTime(value)
        return {
            value,
            label: reminderTime ? `${baseLabel} • ${reminderTime}` : baseLabel
        }
    })
})

const saveDateRappel = async(id: string) => {
    if (!id || !datetime.value) return
    await addDateRappel(id, datetime.value, selectedReminders.value)
    await getDetailedRdv(id)
    emit('update:daterappel', datetime.value.toISOString())
    emit('closePopover')
}
</script>

<style scoped>
.date-rappel{
    overflow-y: scroll;
    max-height: 550px;
    width: auto;
    max-width: auto;
    overflow-x: hidden;
}
</style>
