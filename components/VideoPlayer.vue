<template>
  <div class="video-player-container">
    <div class="video-wrapper">
      <video
        ref="videoRef"
        :src="videoUrl"
        :poster="thumbnailUrl"
        controls
        preload="metadata"
        class="w-full h-auto rounded-lg shadow-lg"
        @loadedmetadata="onVideoLoaded"
        @timeupdate="onTimeUpdate"
        @play="onPlay"
        @pause="onPause"
      >
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>
      
      <!-- Contrôles personnalisés -->
      <div class="video-controls mt-4 flex flex-wrap gap-3 items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <Icon name="lucide:play" class="w-4 h-4" />
            <span class="text-sm text-gray-600">{{ formatTime(currentTime) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="lucide:clock" class="w-4 h-4" />
            <span class="text-sm text-gray-600">{{ formatTime(duration) }}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="toggleFullscreen"
            class="flex items-center gap-2"
          >
            <Icon name="lucide:expand" class="w-4 h-4" />
            Plein écran
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="downloadVideo"
            class="flex items-center gap-2"
          >
            <Icon name="lucide:download" class="w-4 h-4" />
            Télécharger
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Informations de la vidéo -->
      <div class="video-info mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">{{ title }}</h3>
      <p class="text-gray-600 mb-3">{{ description }}</p>
      
      <div class="flex flex-wrap gap-2 mb-3">
        <Badge
          v-for="tag in tags"
          :key="tag"
          variant="secondary"
          class="text-xs"
        >
          {{ tag }}
        </Badge>
      </div>
      
      <div class="flex items-center gap-4 text-sm text-gray-500">
        <div class="flex items-center gap-1">
          <Icon name="lucide:calendar" class="w-4 h-4" />
          <span>{{ formatDate(createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Commentaires uniquement -->
    <div class="mt-4">
      <div class="mt-3 space-y-3">
        <form class="flex gap-2" @submit.prevent="submitComment">
          <input v-model="commentText" class="flex-1 border rounded px-3 py-2" placeholder="Ajouter un commentaire..." />
          <Button type="submit">Publier</Button>
        </form>
        <div class="space-y-2">
          <slot name="comments"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  videoUrl: string
  thumbnailUrl?: string
  title: string
  description: string
  tags?: string[]
  createdAt?: string
}

const { videoUrl, thumbnailUrl, title, description, tags, createdAt } = defineProps<Props>()
const emit = defineEmits<{ (e: 'comment', content: string): void }>()

const videoRef = ref<HTMLVideoElement>()
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const isFullscreen = ref(false)
const commentText = ref('')

const submitComment = () => {
  if (!commentText.value.trim()) return
  emit('comment', commentText.value)
  commentText.value = ''
}

const onVideoLoaded = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
}

const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
  }
}

const onPlay = () => {
  isPlaying.value = true
}

const onPause = () => {
  isPlaying.value = false
}

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const formatDate = (date?: string): string => {
  if (!date) return 'Date inconnue'
  return new Date(date).toLocaleDateString('fr-FR')
}

const toggleFullscreen = () => {
  if (!videoRef.value) return
  
  if (!isFullscreen.value) {
    if (videoRef.value.requestFullscreen) {
      videoRef.value.requestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

const downloadVideo = () => {
  const link = document.createElement('a')
  link.href = videoUrl
  link.download = `${title}.mp4`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Gestion du plein écran
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.video-player-container {
  max-width: 100%;
}

.video-wrapper {
  position: relative;
  
}

.video-controls {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 12px;
}

/* Styles pour le mode plein écran */
:fullscreen .video-player-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: black;
}

:fullscreen .video-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:fullscreen video {
  max-width: 100%;
  max-height: 80%;
}
</style>
