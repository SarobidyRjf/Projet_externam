<template>
    <div @click.stop class="p-2 w-64">
        <div class="flex flex-col gap-2 max-h-64 overflow-y-auto">
                <div v-for="user in users" :key="user._id" class="flex items-center space-x-2">
                    <Checkbox 
                        :id="user._id" 
                        :modelValue="selected.includes(String(user._id))"
                        @update:modelValue="(value: boolean | 'indeterminate') => toggle(String(user._id), value === true)"
                        />
                    <Label :for="user._id">{{ user.prenom }}</Label>
                </div>
        </div>
        <Button :disabled="!selected.length" class="mt-4 w-full" variant="secondary" @click="save">Enregistrer</Button>
    </div>
</template>

<script setup lang="ts">
import { useDetailedRdv } from "~/stores/leads/detailedRdv"
import { useUserStore } from "~/stores/user";

const { getCommercialUser } = useUserStore()
const { user_commercial } = storeToRefs(useUserStore());

const props = defineProps<{
    leadId: string
}>()

const emit = defineEmits(['closePopover'])
const { rdvDetailed } = storeToRefs(useDetailedRdv())
const { updateMembres } = useDetailedRdv()

const users = ref<any[]>([])
const selected = ref<string[]>([])

onMounted(async () => {
    await getCommercialUser()
    users.value = user_commercial.value 
    selected.value = rdvDetailed.value?.membres?.map((m: any) => m._id || m) || []
    console.log('selected on mount', selected.value)
    console.log('users', users.value.map(u => String(u._id)))
})

const save = async () => {
    console.log('selected',selected.value)
    await updateMembres(props.leadId, selected.value)
    emit('closePopover')
}

const toggle = (id: string, checked: boolean) => {
    console.log('toggle', id, checked)
  if (checked) {
    selected.value.push(id)
  } else {
    selected.value = selected.value.filter(item => item !== id)
  }
}
</script>

<style lang="scss" scoped>
</style>
