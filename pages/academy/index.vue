<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useFetch } from '#app'
import VideoPlayer from '~/components/VideoPlayer.vue'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Tutorial = {
  _id: string
  title: string
  description: string
  type: 'video' | 'pdf'
  fileUrl: string
  thumbnailUrl?: string
  tags?: string[]
  createdAt: string
  durationMinutes?: number
}

const q = ref('')
const type = ref<'all' | 'video' | 'pdf'>('all')
const selectedTutorial = ref<Tutorial | null>(null)
const showVideoPlayer = ref(false)
const comments = ref<Array<{ _id: string; userName?: string; userEmail?: string; content: string; createdAt: string }>>([])

const { data, refresh, pending } = await useFetch('/api/academy/tutorials', {
  query: computed(() => ({
    published: 'true',
    q: q.value || undefined,
    type: type.value !== 'all' ? type.value : undefined
  }))
})

const items = computed<Tutorial[]>(() => (data.value?.data as Tutorial[]) || [])

onMounted(() => {
  // initial refresh already done by useFetch
})

// Permission gating (read-only vs write/delete)
const { ability } = storeToRefs(useAuthStore())
const _canRead = computed(() => !!(ability.value?.can('manage','all') || ability.value?.can('read','Tutorial')))
const _canCreate = computed(() => !!(ability.value?.can('manage','all') || ability.value?.can('create','Tutorial')))
const canUpdate = computed(() => !!(ability.value?.can('manage','all') || ability.value?.can('update','Tutorial')))
const canDelete = computed(() => !!(ability.value?.can('manage','all') || ability.value?.can('delete','Tutorial')))

function openItem(item: Tutorial) {
  selectedTutorial.value = item
  showVideoPlayer.value = true
  if (item.type === 'video') {
    fetchComments()
  }
}

function closeVideoPlayer() {
  showVideoPlayer.value = false
  selectedTutorial.value = null
}

function downloadTutorial(item: Tutorial) {
  const link = document.createElement('a')
  link.href = item.fileUrl
  link.download = `${item.title}.${item.type === 'video' ? 'mp4' : 'pdf'}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function fetchComments() {
  if (!selectedTutorial.value) return
  const res = await $fetch('/api/academy/comments', { query: { tutorialId: selectedTutorial.value._id } })
  comments.value = (res as { data?: unknown[] })?.data || []
}

// reactions removed

async function addComment(content: string) {
  if (!selectedTutorial.value || !content.trim()) return
  await $fetch('/api/academy/comments', { method: 'POST', body: { tutorialId: selectedTutorial.value._id, content } })
  await fetchComments()
}

function formatDuration(minutes?: number): string {
  if (!minutes) return 'Durée inconnue'
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  if (hours > 0) {
    return `${hours}h ${mins}min`
  }
  return `${mins}min`
}

function formatDate(date?: string): string {
  if (!date) return 'Date inconnue'
  return new Date(date).toLocaleDateString('fr-FR')
}
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Titre de la page -->
    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <h2 class="text-2xl font-bold tracking-tight">Academy</h2>
        <span class="text-slate-500">
          Découvrez nos tutoriels vidéo et documents PDF.
        </span>
      </div>
    </div>

    <!-- Lecteur vidéo modal -->
    <Dialog v-model:open="showVideoPlayer">
      <DialogContent class="max-w-[95vw] w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ selectedTutorial?.title }}</DialogTitle>
          <DialogDescription>
            {{ selectedTutorial?.type === 'video' ? 'Tutoriel vidéo' : 'Document PDF' }} - {{ selectedTutorial?.description }}
          </DialogDescription>
        </DialogHeader>
        
        <div v-if="selectedTutorial" class="mt-4">
          <!-- Vidéo -->
          <VideoPlayer
            v-if="selectedTutorial.type === 'video'"
            :video-url="selectedTutorial.fileUrl"
            :thumbnail-url="selectedTutorial.thumbnailUrl"
            :title="selectedTutorial.title"
            :description="selectedTutorial.description"
            :tags="selectedTutorial.tags"
            :created-at="selectedTutorial.createdAt"
            @comment="addComment"
          />
          
          <!-- PDF -->
          <div v-else-if="selectedTutorial.type === 'pdf'" class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-semibold text-lg mb-2">{{ selectedTutorial.title }}</h3>
              <p class="text-gray-600 mb-3">{{ selectedTutorial.description }}</p>
              <div v-if="selectedTutorial.tags && selectedTutorial.tags.length" class="flex flex-wrap gap-1 mb-3">
                <span v-for="tag in selectedTutorial.tags" :key="tag" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <div class="border rounded-lg overflow-hidden">
              <iframe 
                :src="selectedTutorial.fileUrl" 
                class="w-full h-[600px]"
                title="PDF Viewer"
              />
            </div>
          </div>
          
          <!-- Commentaires pour vidéos -->
          <div v-if="selectedTutorial.type === 'video' && comments.length" class="mt-4 space-y-3">
            <div class="font-medium text-sm text-gray-600">Commentaires</div>
            <div v-for="c in comments" :key="c._id" class="text-sm border rounded p-2">
              <div class="text-gray-800"><span class="font-semibold">{{ c.userName || c.userEmail || 'Utilisateur' }}</span> — {{ c.content }}</div>
              <div class="text-xs text-gray-400">{{ new Date(c.createdAt).toLocaleString('fr-FR') }}</div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="closeVideoPlayer">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div class="filters grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="flex items-center gap-2 relative">
        <Input v-model="q" placeholder="Rechercher un tutoriel..." class="w-full" @input="refresh()" />
        <span class="absolute end-0 inset-y-0 flex items-center justify-center px-2 cursor-pointer" @click="q = ''; refresh()">
          <Icon name="lucide:x" class="w-4 h-4 text-gray-400" />
        </span>
      </div>
      <Select v-model="type" class="w-48" @update:model-value="refresh()">
        <SelectTrigger>
          <SelectValue placeholder="Type de tutoriel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les tutoriels</SelectItem>
          <SelectItem value="video">Vidéos</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="pending" class="text-sm text-gray-500">Chargement...</div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="item in items" :key="item._id" class="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer group">
        <div class="aspect-video bg-muted rounded mb-3 overflow-hidden flex items-center justify-center relative">
          <img v-if="item.thumbnailUrl" :src="item.thumbnailUrl" alt="thumb" class="w-full h-full object-cover">
          <span v-else class="text-xs text-gray-500">{{ item.type.toUpperCase() }}</span>
          
          <!-- Overlay avec boutons d'action -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div class="flex gap-2">
              <Button
                size="sm"
                class="flex items-center gap-2"
                @click.stop="openItem(item)"
              >
                <Icon :name="item.type === 'video' ? 'lucide:play' : 'lucide:file-text'" class="w-4 h-4" />
                {{ item.type === 'video' ? 'Lire' : 'Lire PDF' }}
              </Button>
              <Button
                size="sm"
                variant="outline"
                class="flex items-center gap-2"
                @click.stop="downloadTutorial(item)"
              >
                <Icon name="lucide:download" class="w-4 h-4" />
                Télécharger
              </Button>
              <Button
                v-if="canUpdate"
                size="sm"
                variant="ghost"
                class="flex items-center gap-2"
                disabled
                title="Modifier (admin seulement ici)"
              >
                <Icon name="lucide:pencil" class="w-4 h-4" />
              </Button>
              <Button
                v-if="canDelete"
                size="sm"
                variant="ghost"
                class="flex items-center gap-2 text-red-600"
                disabled
                title="Supprimer (admin seulement ici)"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div class="space-y-2">
          <h3 class="font-medium text-lg">{{ item.title }}</h3>
          <p class="text-sm text-gray-500 line-clamp-2">{{ item.description }}</p>
          
          <div class="flex flex-wrap gap-1">
            <Badge
              v-for="tag in item.tags"
              :key="tag"
              variant="secondary"
              class="text-xs"
            >
              {{ tag }}
            </Badge>
          </div>
          
          <div class="flex items-center justify-between text-xs text-gray-400">
            <div class="flex items-center gap-1">
              <Icon name="lucide:clock" class="w-3 h-3" />
              <span v-if="item.type === 'video' && item.durationMinutes">
                {{ formatDuration(item.durationMinutes) }}
              </span>
              <span v-else>{{ item.type.toUpperCase() }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Icon name="lucide:calendar" class="w-3 h-3" />
              <span>{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-muted {
  background-color: rgba(0,0,0,0.05);
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>


