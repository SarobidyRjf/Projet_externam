<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFetch } from '#app'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { DataTable } from '@/components/ui/data-table'
import type { ColumnDefProps } from '@/components/ui/data-table/DataTable.vue'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

definePageMeta({ middleware: 'auth' })

type Activity = {
  _id: string
  userId: string
  tutorialId: string
  type: 'view' | 'download' | 'like' | 'love' | 'comment'
  content?: string
  createdAt: string
  tutorialTitle?: string
  userEmail?: string
  userName?: string
  tutorialType?: 'video' | 'pdf'
}

const { ability } = storeToRefs(useAuthStore())
const canRead = computed(() => !!(ability.value?.can('manage','all') || ability.value?.can('read','TutorialTracking')))

const q = ref('')
const typeFilter = ref<'all'|'view'|'download'|'like'|'love'|'comment'>('all')
const tutorialTypeFilter = ref<'all'|'video'|'pdf'>('all')
const { data, refresh, pending } = await useFetch('/api/academy/tracking', {
  query: computed(() => ({ q: q.value || undefined }))
})

const items = computed<Activity[]>(() => {
  const rows = (data.value?.data as any) || []
  let filtered = rows
  
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter((r: Activity) => r.type === typeFilter.value)
  }
  
  if (tutorialTypeFilter.value !== 'all') {
    filtered = filtered.filter((r: Activity) => r.tutorialType === tutorialTypeFilter.value)
  }
  
  return filtered
})

const tableRef = ref<any>()

const deleteSelected = async () => {
  const ids: string[] = (tableRef.value?.table?.getSelectedRowModel?.().rows || []).map((r: any) => r.original._id)
  if (!ids.length) return
  await $fetch('/api/academy/tracking/bulk', { method: 'DELETE', body: { ids } })
  await refresh()
}

const deleteAll = async () => {
  await $fetch('/api/academy/tracking/all', { method: 'DELETE' })
  await refresh()
}

const columns = ref<ColumnDefProps[]>([
  { id: 'select', enableAllPageRowsSelected: true, enableRowSelection: true },
  { accessorKey: 'userName', header: "Nom d'utilisateur", enableSorting: true },
  { accessorKey: 'userEmail', header: 'Email', enableSorting: true },
  { accessorKey: 'tutorialTitle', header: 'Tutoriel', enableSorting: true },
  { accessorKey: 'tutorialType', header: 'Type', cell: ({ row }: any) => (row.original.tutorialType === 'pdf' ? 'PDF' : 'Vidéo'), enableSorting: true },
  { accessorKey: 'createdAt', header: 'Date', cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleString('fr-FR'), enableSorting: true },
  { accessorKey: 'content', header: 'Commentaire', enableSorting: false },
])

onMounted(() => {
  if (!canRead.value) navigateTo('/403')
})
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <h2 class="text-2xl font-bold tracking-tight">Suivi des activités Academy</h2>
        <span class="text-slate-500">
          Suivi et analyse des interactions avec les tutoriels
        </span>
      </div>
    </div>

    <div class="flex gap-2 items-center flex-wrap">
      <Input v-model="q" @input="refresh()" placeholder="Rechercher (nom, email, titre)" class="w-full md:w-96" />
      
      <div class="ml-auto flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button variant="destructive" size="sm">Supprimer sélection</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Voulez-vous vraiment supprimer les suivis sélectionnés ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction @click="deleteSelected">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button variant="outline" size="sm" class="text-red-600">Tout supprimer</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression totale</AlertDialogTitle>
              <AlertDialogDescription>
                Voulez-vous vraiment supprimer tous les suivis ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction @click="deleteAll">Supprimer tout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <span v-if="pending" class="text-sm text-gray-500">Chargement...</span>
    </div>

    <DataTable ref="tableRef" :columns="columns" :data="items" />
  </div>
</template>


