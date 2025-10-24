<template>
  <DashboardContent>
    <template #header>
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-bold tracking-tight">Gestion des logiciels</h2>
        <p class="text-muted-foreground text-sm">
          Ajoutez, modifiez ou supprimez les logiciels utilisés par les équipes.
        </p>
      </div>
    </template>

    <Card v-if="canRead" class="w-full">
      <CardContent class="p-6 space-y-6">
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="flex flex-wrap gap-2">
            <TabsTrigger
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
              class="capitalize"
            >
              {{ tab.label }}
              <span class="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{{ totals[tab.value] }}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            class="space-y-4"
          >
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div class="w-full md:max-w-sm">
                <Label class="mb-1 block text-sm font-medium text-muted-foreground">
                  Rechercher par libellé
                </Label>
                <Input
                  v-model="searchQuery[tab.value]"
                  placeholder="Rechercher un logiciel"
                />
              </div>
              <Button
                v-if="canCreate"
                type="button"
                class="self-start md:self-center"
                @click="openCreateDialog(tab.value)"
              >
                <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>

            <div v-if="loading[tab.value]" class="space-y-4">
              <TableSkeleton :rows="5" :show-header="false" />
            </div>
            <div v-else>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-56">Libellé</TableHead>
                    <TableHead>Champs personnalisés</TableHead>
                    <TableHead class="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="!lists[tab.value].length">
                    <TableCell colspan="3" class="text-center text-sm text-muted-foreground py-6">
                      Aucun élément trouvé.
                    </TableCell>
                  </TableRow>
                  <TableRow v-for="item in lists[tab.value]" :key="item._id">
                    <TableCell class="font-medium">{{ item.label }}</TableCell>
                    <TableCell>
                      <div
                        v-if="item.fields && item.fields.length"
                        class="flex flex-col gap-1"
                      >
                        <div
                          v-for="(field, index) in item.fields"
                          :key="`${item._id}-field-${index}`"
                          class="flex flex-wrap gap-1 text-sm"
                        >
                          <span class="font-medium text-muted-foreground">{{ field.key }}:</span>
                          <span>{{ field.value }}</span>
                        </div>
                      </div>
                      <span v-else class="text-sm italic text-muted-foreground">
                        Aucun champ supplémentaire
                      </span>
                    </TableCell>
                    <TableCell class="text-right">
                      <div class="flex items-center justify-end gap-2">
                        <Button
                          v-if="canUpdate"
                          variant="outline"
                          size="icon"
                          class="h-8 w-8"
                          @click="openEditDialog(tab.value, item)"
                        >
                          <Icon name="lucide:pencil" class="h-4 w-4" />
                        </Button>

                        <AlertDialog v-if="canDelete">
                          <AlertDialogTrigger as-child>
                            <Button variant="outline" size="icon" class="h-8 w-8">
                              <Icon name="lucide:trash-2" class="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce logiciel ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Le logiciel sera définitivement supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction @click="deleteSoftware(tab.value, item._id)">
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <p v-else class="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
      Vous n'avez pas la permission d'accéder à cette section.
    </p>

    <Dialog v-if="canRead" v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ dialogTitle }}</DialogTitle>
          <DialogDescription>
            Complétez les informations pour {{ isEditing ? 'mettre à jour' : 'ajouter' }} un logiciel.
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submitForm">
          <div class="space-y-2">
            <Label for="logiciel-label">Libellé</Label>
            <Input id="logiciel-label" v-model="form.label" placeholder="Nom du logiciel" />
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <Label>Champs personnalisés</Label>
              <Button type="button" variant="outline" size="sm" @click="addField">
                <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
                Ajouter un champ
              </Button>
            </div>
            <div class="space-y-3">
              <div
                v-for="(field, index) in form.fields"
                :key="`field-${index}`"
                class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  v-model="field.key"
                  placeholder="Clé"
                  aria-label="Clé du champ personnalisé"
                />
                <Input
                  v-model="field.value"
                  placeholder="Valeur"
                  aria-label="Valeur du champ personnalisé"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="justify-self-end text-destructive"
                  :disabled="form.fields.length === 1"
                  @click="removeField(index)"
                >
                  <Icon name="lucide:x" class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <p v-if="formErrors" class="text-sm text-destructive">{{ formErrors }}</p>

          <DialogFooter>
            <DialogClose as-child>
              <Button type="button" variant="outline">Annuler</Button>
            </DialogClose>
            <Button type="submit" :disabled="submitLoading">
              <Icon
                v-if="submitLoading"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ isEditing ? 'Mettre à jour' : 'Créer' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </DashboardContent>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useAuthStore } from '~/stores/auth'
import {
  useLogicielStore,
  type SoftwareField,
  type SoftwareItem,
  type SoftwareTabKey
} from '~/stores/logiciel'

definePageMeta({
  middleware: 'auth'
})

type TabKey = SoftwareTabKey

type TabDefinition = {
  label: string
  value: TabKey
}

const tabs: TabDefinition[] = [
  { label: 'Logiciels', value: 'logiciel' },
  { label: 'Logiciels IA', value: 'logicielIA' },
  { label: 'Voix IA', value: 'voixIA' }
]

const activeTab = ref<TabKey>('logiciel')
const searchQuery = reactive<Record<TabKey, string>>({
  logiciel: '',
  logicielIA: '',
  voixIA: ''
})

const dialogOpen = ref(false)
const submitLoading = ref(false)
const formErrors = ref<string | null>(null)
const editingType = ref<TabKey | null>(null)

const logicielStore = useLogicielStore()
const { lists, totals, loading, loaded } = storeToRefs(logicielStore)

const createEmptyField = (): SoftwareField => ({ key: '', value: '' })

const form = reactive<SoftwareItem>({
  _id: undefined,
  label: '',
  fields: [createEmptyField()]
})

const { ability } = storeToRefs(useAuthStore())

const canRead = computed(() =>
  Boolean(
    ability.value?.can('manage', 'LeadMeta') || ability.value?.can('read', 'LeadMeta')
  )
)
const canCreate = computed(() =>
  Boolean(
    ability.value?.can('manage', 'LeadMeta') ||
    ability.value?.can('create', 'LeadMeta') ||
    ability.value?.can('update', 'LeadMeta')
  )
)
const canUpdate = canCreate
const canDelete = computed(() =>
  Boolean(
    ability.value?.can('manage', 'LeadMeta') ||
    ability.value?.can('delete', 'LeadMeta') ||
    ability.value?.can('update', 'LeadMeta')
  )
)

const isEditing = computed(() => Boolean(form._id))
const dialogTitle = computed(() =>
  isEditing.value ? 'Modifier un logiciel' : 'Ajouter un logiciel'
)

const debouncedFetchers: Record<TabKey, ReturnType<typeof useDebounceFn>> = {
  logiciel: useDebounceFn(() => fetchSoftware('logiciel'), 400),
  logicielIA: useDebounceFn(() => fetchSoftware('logicielIA'), 400),
  voixIA: useDebounceFn(() => fetchSoftware('voixIA'), 400)
}

watch(
  () => searchQuery.logiciel,
  () => {
    if (loaded.value.logiciel) {
      debouncedFetchers.logiciel()
    }
  }
)

watch(
  () => searchQuery.logicielIA,
  () => {
    if (loaded.value.logicielIA) {
      debouncedFetchers.logicielIA()
    }
  }
)

watch(
  () => searchQuery.voixIA,
  () => {
    if (loaded.value.voixIA) {
      debouncedFetchers.voixIA()
    }
  }
)

watch(dialogOpen, (open) => {
  if (!open) {
    resetForm()
  }
})

watch(canRead, (value) => {
  if (value && !loaded.value[activeTab.value]) {
    fetchSoftware(activeTab.value)
  }
})

onMounted(() => {
  if (canRead.value) {
    fetchSoftware(activeTab.value)
  }
})

watch(
  () => activeTab.value,
  (type) => {
    if (!loaded.value[type] && canRead.value) {
      fetchSoftware(type)
    }
  }
)

function resetForm() {
  form._id = undefined
  form.label = ''
  form.fields = [createEmptyField()]
  formErrors.value = null
  submitLoading.value = false
}

function ensureFieldsInitialized() {
  if (!form.fields.length) {
    form.fields = [createEmptyField()]
  }
}

function openCreateDialog(type: TabKey) {
  if (!canCreate.value) return
  editingType.value = type
  resetForm()
  dialogOpen.value = true
}

function openEditDialog(type: TabKey, item: SoftwareItem) {
  if (!canUpdate.value) return
  editingType.value = type
  form._id = item._id
  form.label = item.label
  form.fields = (item.fields && item.fields.length
    ? item.fields.map((field) => ({ key: field.key ?? '', value: field.value ?? '' }))
    : [createEmptyField()])
  formErrors.value = null
  dialogOpen.value = true
}

function addField() {
  form.fields.push(createEmptyField())
}

function removeField(index: number) {
  form.fields.splice(index, 1)
  ensureFieldsInitialized()
}

async function fetchSoftware(type: TabKey) {
  if (!canRead.value) {
    return
  }

  try {
    await logicielStore.fetchSoftware(type, searchQuery[type] || undefined)
  } catch (error: any) {
    console.error(error)
    const message = error?.data?.statusMessage || error?.message || 'Une erreur est survenue lors du chargement.'
    toast.error(message)
  }
}

function sanitizePayloadFields(fields: SoftwareField[]) {
  return fields
    .map((field) => ({
      key: field.key.trim(),
      value: field.value.trim()
    }))
    .filter((field) => field.key && field.value)
}

async function submitForm() {
  if (!editingType.value) return

  const label = form.label.trim()

  if (!label) {
    formErrors.value = 'Le libellé est requis.'
    return
  }

  const fields = sanitizePayloadFields(form.fields)

  submitLoading.value = true
  formErrors.value = null

  try {
    const payload = { label, fields }

    if (form._id) {
      await logicielStore.updateSoftware(editingType.value, form._id, payload)
      toast.success('Logiciel mis à jour avec succès')
    } else {
      await logicielStore.createSoftware(editingType.value, payload)
      toast.success('Logiciel créé avec succès')
    }

    dialogOpen.value = false
    await fetchSoftware(editingType.value)
  } catch (error: any) {
    console.error(error)
    const message = error?.data?.statusMessage || error?.message || 'Impossible de sauvegarder le logiciel.'
    formErrors.value = message
    toast.error(message)
  } finally {
    submitLoading.value = false
  }
}

async function deleteSoftware(type: TabKey, id: string) {
  if (!canDelete.value) return

  try {
    await logicielStore.deleteSoftware(type, id)
    toast.success('Logiciel supprimé avec succès')
    await fetchSoftware(type)
  } catch (error: any) {
    console.error(error)
    const message = error?.data?.statusMessage || error?.message || 'Impossible de supprimer le logiciel.'
    toast.error(message)
  }
}
</script>
