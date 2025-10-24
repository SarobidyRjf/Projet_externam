<template>
    <form class="checklist" @submit.prevent="ajoutChecklist(props.leadId)">
        <h1 class="text-center text-[14px] font-semibold">Ajouter une checklist</h1>
        <div class="flex flex-col gap-4 mt-4">
            <Label>Titre :</Label>
            <Input v-model="checklistTitle" type="text" />
            <Button :disabled="isAdding" type="submit" class="bg-blue-700 hover:bg-blue-800 cursor-pointer w-fit rounded-[5px]">
                <Loader2 v-if="isAdding" class="h-4 w-4 animate-spin" />
                <span>{{ isAdding ? 'Ajouter' : 'Ajouter' }}</span>
            </Button>
        </div>

    </form>
</template>

<script setup lang="ts">
import { useDetailedRdv } from "~/stores/leads/detailedRdv"
import { Loader2 } from "lucide-vue-next"

const detailedRdvStore = useDetailedRdv()
const { addChecklist, getDetailedRdv } = detailedRdvStore

const props = defineProps({
    leadId: {
        type: [String],
        required: true
    }
})
const emits =defineEmits(['closePopover'])

const checklistTitle = ref<string>('')
const isAdding = ref(false)

const ajoutChecklist = async (id?: string) => {
    if(!checklistTitle.value || !id) return
    isAdding.value = true
    try {
        await addChecklist(id, checklistTitle.value)
        await getDetailedRdv(id)
        checklistTitle.value = ''
        emits('closePopover')
    } finally {
        isAdding.value = false
    }
}
</script>

<style lang="scss" scoped>

</style>