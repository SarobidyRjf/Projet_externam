<template>
    <div @click.stop>
        <div class="mb-4">
            <p class="text-sm font-semibold">Séléctionner le niveau du prospect :</p>
        </div>
        <RadioGroup v-model="niveauProspect" @update:modelValue="(value) => addLevel(props.leadId, Number(value))">
            <div class="flex items-center space-x-2" v-for="(level, index) in levelProspect" :key="index">
                <RadioGroupItem
                  id="option-one"
                  :value="level.value" />
                <p class="text-gray-700 dark:text-gray-300 text-sm" for="option-one">{{ level.label }}</p>
            </div>
        </RadioGroup>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth';
import { useDetailedRdv } from "~/stores/leads/detailedRdv"
import { useLeadsStore } from '~/stores/leads';

const { getDetailedRdv, addLevelProspect } = useDetailedRdv()
const { getLeadsByUser } = useLeadsStore()
const { userConnected } = storeToRefs(useAuthStore());

const { loading, rdvDetailed } = storeToRefs(useDetailedRdv())

const props = defineProps<{
    leadId: string
}>()
const niveauProspect = ref<number | null>(null)
const emit =defineEmits(['update:daterappel', 'closePopover'])

const levelProspect = ref([
        { label: "Niveau 1", value: 1 },
        { label: "Niveau 2", value: 2 },
        { label: "Niveau 3", value: 3 },
    ]
)

const addLevel = async (id: string, level: number) => {
    console.log('hello')
    await addLevelProspect(id, level)
    await getLeadsByUser(userConnected.value._id)
    emit('closePopover')
}

const fetchCurrentLevel = async (id: string) => {
    try {
        niveauProspect.value = rdvDetailed?.value?.niveau_prospect || null
        console.log('Niveau actuel du prospect :', niveauProspect.value)
    } catch (error) {
        console.error("Erreur lors de la récupération du niveau :", error)
    }
}

// Appeler fetchCurrentLevel lors du montage du composant
onMounted(() => {
    fetchCurrentLevel(props.leadId)
})
</script>

<style lang="scss" scoped>

</style>