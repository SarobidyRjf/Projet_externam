<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFetch } from '#app'
import type { ColumnDefProps } from '@/components/ui/data-table/DataTable.vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

type Tutorial = {
  _id?: string
  title: string
  description: string
  type: 'video' | 'pdf'
  tags?: string[]
  published?: boolean
  durationMinutes?: number
  fileUrl?: string
  thumbnailUrl?: string
  createdAt?: string
}

const q = ref('')
const showForm = ref(false)
const uploadProgress = ref<number>(0)
const isUploading = ref(false)
const editing = ref<Tutorial | null>(null)
const tagsText = ref('')
const showSuccessMessage = ref(false)
const successMessage = ref('')
const showDeleteDialog = ref(false)
const tutorialToDelete = ref<string | null>(null)

const { data, refresh, pending } = await useFetch('/api/academy/tutorials', {
  query: { published: 'false' },
})

const items = computed<Tutorial[]>(() => (data.value?.data as any) || [])

function newItem() {
  editing.value = { title: '', description: '', type: 'video', tags: [], published: true, durationMinutes: 0 }
  tagsText.value = ''
  showForm.value = true
}

function editItem(item: Tutorial) {
  editing.value = { ...item }
  tagsText.value = (item.tags || []).join(', ')
  showForm.value = true
}

function closeDialog() {
  showForm.value = false
  editing.value = null
  isUploading.value = false
  uploadProgress.value = 0
}

function showSuccess(msg: string) {
  successMessage.value = msg
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

function handleTagsInput(event: Event) {
  const target = event.target as HTMLInputElement
  tagsText.value = target.value
  if (editing.value) {
    editing.value.tags = tagsText.value.split(',').map(x => x.trim()).filter(Boolean)
  }
}

async function onSubmit(e: Event) {
  e.preventDefault()
  if (!editing.value) return
  
  const formEl = e.target as HTMLFormElement
  const fd = new FormData(formEl)
  fd.set('title', editing.value.title)
  fd.set('description', editing.value.description || '')
  fd.set('type', editing.value.type)
  fd.set('tags', (editing.value.tags || []).join(','))
  fd.set('published', String(!!editing.value.published))

  const method = editing.value._id ? 'PUT' : 'POST'
  const url = editing.value._id ? `/api/academy/tutorials/${editing.value._id}` : '/api/academy/tutorials'
  const isUpdate = !!editing.value._id
  uploadProgress.value = 0
  isUploading.value = true
  
  try {
    // XMLHttpRequest to get real upload progress
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, url)
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          uploadProgress.value = Math.round((evt.loaded / evt.total) * 100)
        }
      }
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            uploadProgress.value = 100
            resolve()
          } else {
            reject(new Error(xhr.responseText || 'Upload failed'))
          }
        }
      }
      xhr.onerror = () => reject(new Error('Network error'))
      xhr.send(fd)
    })
    
    // Succès - fermer le dialog et rafraîchir
    showForm.value = false
    editing.value = null
    await refresh()
    // Afficher le message de succès
    if (uploadProgress.value === 100) {
      showSuccess(isUpdate ? 'Tutoriel modifié avec succès !' : 'Tutoriel créé avec succès !')
    }
    
  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err)
    alert('Erreur lors de la sauvegarde: ' + (err as Error).message)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

function confirmDelete(id?: string) {
  if (!id) return
  tutorialToDelete.value = id
  showDeleteDialog.value = true
}

async function removeItem(id?: string) {
  if (!id) return
  const res = await fetch(`/api/academy/tutorials/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    alert('Erreur lors de la suppression')
    return
  }
  await refresh()
  showDeleteDialog.value = false
  tutorialToDelete.value = null
  showSuccess('Tutoriel supprimé avec succès !')
}

const showDetailsDialog = ref(false)
const selectedTutorial = ref<Tutorial | null>(null)

function showTutorialDetails(tutorial: Tutorial) {
  selectedTutorial.value = tutorial
  showDetailsDialog.value = true
}

const columns: ColumnDefProps[] = [
  {
    accessorKey: "title",
    header: "Titre",
    meta: { title: "Titre" },
    enableSorting: true,
  },
  {
    accessorKey: "description",
    header: "Description du tutoriel",
    meta: { title: "Description du tutoriel" },
    enableSorting: false,
  },
  {
    accessorKey: "actions",
    header: "Actions",
    meta: { title: "Actions" },
    enableSorting: false,
    cell: ({ row }: { row: { original: Tutorial } }) => {
      return ''
    }
  },
]

// Fonctions globales pour les actions
if (process.client) {
  (window as any).editTutorial = (id: string) => {
    const item = items.value.find(i => i._id === id)
    if (item) editItem(item)
  }
  (window as any).deleteTutorial = (id: string) => {
    confirmDelete(id)
  }
  (window as any).showTutorialDetails = (id: string) => {
    const item = items.value.find(i => i._id === id)
    if (item) showTutorialDetails(item)
  }
}
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Message de succès -->
    <div v-if="showSuccessMessage" class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
      <Icon name="lucide:check-circle" class="h-5 w-5" />
      {{ successMessage }}
    </div>

    <div class="flex items-center justify-between gap-2">
      <div class="flex flex-col">
        <h2 class="text-2xl font-bold tracking-tight">Gestion des tutoriels</h2>
        <span class="text-slate-500">
          Administration des tutoriels de l'Academy
        </span>
      </div>
      <Button size="sm" class="inline-flex items-center gap-2" @click="newItem">
        <Icon name="lucide:plus" class="h-4 w-4" /> Nouveau
      </Button>
    </div>

    <div class="flex items-center gap-2">
      <Input v-model="q" placeholder="Rechercher un tutoriel..." class="w-full md:w-72" />
    </div>

    <div v-if="pending" class="text-sm text-gray-500">Chargement...</div>

    <div class="w-full space-y-4">
      <DataTable :data="items.filter((i: Tutorial) => i.title.toLowerCase().includes(q.toLowerCase()))" :columns="columns">
        <template #actions-data="{ row }">
          <div class="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              class="h-8 w-8 p-0"
              title="Éditer Tutoriel"
              @click="editItem(row)"
            >
              <Icon name="lucide:pencil" class="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              class="h-8 w-8 p-0"
              title="Voir les détails"
              @click="showTutorialDetails(row)"
            >
              <Icon name="lucide:info" class="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              class="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              title="Supprimer Tutoriel"
              @click="confirmDelete(row._id)"
            >
              <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
            </Button>
          </div>
        </template>
        <template #description-data="{ row }">
          <div class="flex items-center">
            <span class="line-clamp-1 text-sm text-slate-600">{{ row.description || '—' }}</span>
            <Button size="sm" variant="ghost" class="ml-2 h-7 w-7 p-0" title="Voir les détails" @click="showTutorialDetails(row)">
              <Icon name="lucide:eye" class="h-3.5 w-3.5" />
            </Button>
          </div>
        </template>
      </DataTable>
    </div>

    <Dialog v-model:open="showForm">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ editing?._id ? 'Modifier' : 'Nouveau' }} tutoriel</DialogTitle>
          <DialogDescription>
            Complétez les informations pour {{ editing?._id ? 'mettre à jour' : 'ajouter' }} un tutoriel.
          </DialogDescription>
        </DialogHeader>

        <form v-if="editing" class="space-y-4" @submit.prevent="onSubmit">
          <!-- Barre de progression -->
          <div v-if="isUploading" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Upload en cours...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="title">Titre *</Label>
              <Input 
                id="title" 
                v-model="editing.title" 
                placeholder="Titre du tutoriel" 
                required 
              />
            </div>

            <div class="space-y-2">
              <Label for="type">Type *</Label>
              <Select v-model="editing.type">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="md:col-span-2 space-y-2">
              <Label for="description">Description</Label>
              <Textarea 
                id="description" 
                v-model="editing.description" 
                placeholder="Description du tutoriel"
                rows="3"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="tags">Tags</Label>
              <Input 
                id="tags"
                :value="(editing.tags||[]).join(', ')" 
                @input="handleTagsInput($event)" 
                placeholder="tag1, tag2, tag3"
              />
              <p class="text-xs text-gray-500">Séparez les tags par des virgules</p>
            </div>

            <div class="space-y-2">
              <Label for="file">Fichier *</Label>
              <Input 
                id="file"
                type="file" 
                name="file" 
                :accept="editing.type==='pdf' ? 'application/pdf' : 'video/*'" 
                class="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div class="space-y-2">
              <Label for="thumbnail">Miniature</Label>
              <Input 
                id="thumbnail"
                type="file" 
                name="thumbnail" 
                accept="image/*" 
                class="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>

            <div class="md:col-span-2 flex items-center space-x-2">
              <Checkbox 
                id="published" 
                :checked="!!editing.published" 
                @update:checked="editing.published = $event"
              />
              <Label for="published" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Publié
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeDialog">Annuler</Button>
            <Button type="submit" :disabled="isUploading">
              <Icon
                v-if="isUploading"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ editing._id ? 'Mettre à jour' : 'Créer' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Dialog de détails du tutoriel -->
    <Dialog v-model:open="showDetailsDialog">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du tutoriel</DialogTitle>
          <DialogDescription>
            Informations complètes sur le tutoriel sélectionné.
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedTutorial" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-gray-500">Titre</Label>
              <p class="text-sm">{{ selectedTutorial.title }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-gray-500">Type</Label>
              <p class="text-sm">{{ selectedTutorial.type === 'video' ? 'Vidéo' : 'PDF' }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-gray-500">Publié</Label>
              <p class="text-sm">{{ selectedTutorial.published ? 'Oui' : 'Non' }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-gray-500">Date de création</Label>
              <p class="text-sm">{{ selectedTutorial.createdAt ? new Date(selectedTutorial.createdAt).toLocaleDateString('fr-FR') : '-' }}</p>
            </div>
          </div>
          
          <div>
            <Label class="text-sm font-medium text-gray-500">Description</Label>
            <p class="text-sm mt-1">{{ selectedTutorial.description || 'Aucune description' }}</p>
          </div>
          
          <div v-if="selectedTutorial.tags && selectedTutorial.tags.length">
            <Label class="text-sm font-medium text-gray-500">Tags</Label>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-for="tag in selectedTutorial.tags" :key="tag" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showDetailsDialog = false">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Dialog de confirmation de suppression -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Voulez-vous vraiment supprimer ce tutoriel ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteDialog = false">Annuler</AlertDialogCancel>
          <AlertDialogAction @click="removeItem(tutorialToDelete)" class="bg-red-600 hover:bg-red-700">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>



