<template>
    <div @click.stop class="p-2 w-64 space-y-2">
        <div class="flex flex-row gap-4">
            <RadioGroup v-model="category" class="flex flex-col gap-2">
                <div v-for="opt in categories" :key="opt.value" class="flex items-center gap-2">
                    <RadioGroupItem :id="opt.value" :value="opt.value" />
                    <Label :for="opt.value" class="capitalize">{{ opt.label }}</Label>
                </div>
            </RadioGroup>
            <RadioGroup v-if="category === 'docs_societe'" v-model="docType" class="flex flex-col gap-2 border-l pl-4">
                <Label class="text-[11px]">Type de doc :</Label>
                <div v-for="opt in docsSocieteOptions" :key="opt" class="flex items-center gap-2">
                    <RadioGroupItem :id="`doc-${opt}`" :value="opt" />
                    <Label :for="`doc-${opt}`">{{ opt }}</Label>
                </div>
            </RadioGroup>
        </div>
        <Input
            v-if="category && (category !== 'docs_societe' || docType)"
            type="file"
            @change="onFileChange"
        />
    </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ref, watch } from 'vue'
import { useDetailedRdv } from "~/stores/leads/detailedRdv"

const props = defineProps<{ leadId: string }>()
const emit = defineEmits(['closePopover'])
const { uploadPieceJointe } = useDetailedRdv()

const category = ref('')
const docType = ref('')
const categories = [
    { value: 'docs_societe', label: 'Docs société' },
    { value: 'contrat', label: 'Contrat' },
    { value: 'facture', label: 'Facture' },
    { value: 'autre', label: 'Autre' }
]
const docsSocieteOptions = ['CIN', 'CIF', 'NIF', 'Stat', 'RCS', 'RIB']

watch(category, (val) => {
    if (val !== 'docs_societe') {
        docType.value = ''
    }
})

const onFileChange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    await uploadPieceJointe(props.leadId, file, category.value, category.value === 'docs_societe' ? docType.value : undefined)
    emit('closePopover')
}
</script>

<style lang="scss" scoped>
</style>
