<template>
  <DashboardContent>
    <template #header>
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-bold tracking-tight">Mon profil</h2>
        <p class="text-muted-foreground text-sm">
          Consultez et mettez à jour vos informations personnelles.
        </p>
      </div>
    </template>

    <Card class="w-full mx-auto">
      <CardContent class="p-6 space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center text-muted-foreground py-6">
          <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin mx-auto mb-2" />
          Chargement...
        </div>

        <!-- Profile Content -->
        <div v-else-if="profile" class="space-y-6">
          <!-- Avatar Section -->
          <div class="flex flex-col gap-3">
            <div class="relative w-24 h-24">
              <img
                v-if="currentAvatarUrl"
                :src="currentAvatarUrl"
                alt="Avatar de profil"
                class="w-full h-full rounded-full border-2 border-muted object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center rounded-full bg-muted text-xl font-semibold text-muted-foreground"
              >
                {{ getInitials() }}
              </div>
              
              <!-- Loading overlay on avatar -->
              <div
                v-if="avatarLoading"
                class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
              >
                <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin text-white" />
              </div>
            </div>

            <div class="space-y-2">
              <Label
                for="avatarFile"
                class="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
              >
                {{ profile.avatar ? 'Modifier ma photo de profil' : 'Ajouter une photo de profil' }}
              </Label>

              <input
                id="avatarFile"
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                @change="onFileSelected"
                class="hidden"
                :disabled="avatarLoading"
              />

              <Button
                variant="outline"
                size="sm"
                class="w-fit"
                @click="triggerFileInput"
                :disabled="avatarLoading"
              >
                <Icon name="lucide:upload" class="mr-2 h-4 w-4" />
                Choisir une image
              </Button>

              <Button
                v-if="currentAvatarUrl"
                variant="destructive"
                size="sm"
                class="w-fit ml-2"
                @click="deleteAvatar"
                :disabled="avatarLoading"
              >
                <Icon name="lucide:trash-2" class="mr-2 h-4 w-4" />
                Supprimer
              </Button>

              <p class="text-xs text-muted-foreground">
                Formats acceptés: JPG, PNG, WebP, GIF (max 5MB)
              </p>
            </div>
          </div>

          <!-- Form Fields -->
          <form @submit.prevent="update" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="nom" class="text-sm font-medium">
                  Nom <span class="text-destructive">*</span>
                </Label>
                <Input
                  id="nom"
                  v-model="edit.nom"
                  placeholder="Votre nom"
                  :class="{ 'border-destructive': errors.nom }"
                  required
                />
                <p v-if="errors.nom" class="text-xs text-destructive mt-1">
                  {{ errors.nom }}
                </p>
              </div>

              <div>
                <Label for="prenom" class="text-sm font-medium">
                  Prénom <span class="text-destructive">*</span>
                </Label>
                <Input
                  id="prenom"
                  v-model="edit.prenom"
                  placeholder="Votre prénom"
                  :class="{ 'border-destructive': errors.prenom }"
                  required
                />
                <p v-if="errors.prenom" class="text-xs text-destructive mt-1">
                  {{ errors.prenom }}
                </p>
              </div>

              <div class="md:col-span-2">
                <Label for="metier" class="text-sm font-medium">Métier</Label>
                <Input
                  id="metier"
                  v-model="edit.metier"
                  placeholder="Ex: Développeur web"
                />
              </div>
            </div>

            <!-- Success/Error Messages -->
            <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded-md">
              <p class="text-sm text-green-800">{{ successMessage }}</p>
            </div>

            <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-md">
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-2 pt-4 border-t border-muted/40">
              <Button
                type="button"
                variant="outline"
                @click="resetForm"
                :disabled="submitLoading"
              >
                Annuler
              </Button>
              <Button type="submit" :disabled="submitLoading || !hasChanges()">
                <Icon
                  v-if="submitLoading"
                  name="lucide:loader-2"
                  class="mr-2 h-4 w-4 animate-spin"
                />
                <Icon v-else name="lucide:save" class="mr-2 h-4 w-4" />
                Mettre à jour
              </Button>
            </div>
          </form>
        </div>

        <!-- No Profile State -->
        <div v-else class="text-center text-muted-foreground py-6">
          <Icon name="lucide:user-x" class="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Aucune information de profil trouvée.</p>
        </div>
      </CardContent>
    </Card>
  </DashboardContent>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const store = useUserStore()
const { getProfile, updateProfile, deleteProfile } = store
const { profile, loading } = storeToRefs(store)

const edit = reactive({
  nom: '',
  prenom: '',
  metier: '',
  avatar: ''
})

const errors = reactive({
  nom: '',
  prenom: ''
})

const submitLoading = ref(false)
const avatarLoading = ref(false)
const previewAvatar = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const successMessage = ref('')
const errorMessage = ref('')

// Original values for change detection
let originalValues: any = {}

// Computed property for avatar display
const currentAvatarUrl = computed(() => {
  // Priority: preview only (during upload) > profile avatar
  if (previewAvatar.value) return previewAvatar.value
  if (profile.value?.avatar) return profile.value.avatar
  return ''
})

onMounted(async () => {
  await getProfile()
  if (store.profile) {
    Object.assign(edit, store.profile)
    originalValues = { ...store.profile }
  }
})

const getInitials = () => {
  const nom = edit.nom || profile.value?.nom || ''
  const prenom = edit.prenom || profile.value?.prenom || ''
  return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase() || '?'
}

const hasChanges = () => {
  return (
    edit.nom !== originalValues.nom ||
    edit.prenom !== originalValues.prenom ||
    edit.metier !== originalValues.metier
  )
}

const validateForm = () => {
  errors.nom = ''
  errors.prenom = ''
  let isValid = true

  if (!edit.nom || edit.nom.trim().length < 2) {
    errors.nom = 'Le nom doit contenir au moins 2 caractères'
    isValid = false
  }

  if (!edit.prenom || edit.prenom.trim().length < 2) {
    errors.prenom = 'Le prénom doit contenir au moins 2 caractères'
    isValid = false
  }

  return isValid
}

const update = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  if (!validateForm()) return

  submitLoading.value = true
  try {
    await updateProfile(edit)
    originalValues = { ...edit }
    successMessage.value = 'Profil mis à jour avec succès !'
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    errorMessage.value = 'Erreur lors de la mise à jour du profil'
    console.error(err)
  } finally {
    submitLoading.value = false
  }
}

const resetForm = () => {
  Object.assign(edit, originalValues)
  errors.nom = ''
  errors.prenom = ''
  successMessage.value = ''
  errorMessage.value = ''
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'L\'image ne doit pas dépasser 5MB'
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Le fichier doit être une image'
    return
  }

  // Nettoyer l'ancien preview s'il existe
  if (previewAvatar.value) {
    URL.revokeObjectURL(previewAvatar.value)
  }

  // Créer et afficher le nouveau preview immédiatement
  previewAvatar.value = URL.createObjectURL(file)
  avatarLoading.value = true
  errorMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('avatar', file)

    const res = await fetch('/api/user/upload-avatar', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erreur lors de l\'upload de l\'avatar')
    }

    const data = await res.json()
    const newAvatarUrl = data.avatar

    // Preload image from server before updating
    const img = new Image()
    
    await new Promise((resolve, reject) => {
      img.onload = () => {
        // ORDRE CRITIQUE: D'abord mettre à jour les valeurs
        if (store.profile) {
          store.profile.avatar = newAvatarUrl
        }
        edit.avatar = newAvatarUrl
        
        // Nettoyer le preview pour afficher l'URL serveur
        if (previewAvatar.value) {
          URL.revokeObjectURL(previewAvatar.value)
          previewAvatar.value = ''
        }
        
        resolve(null)
      }
      img.onerror = reject
      img.src = newAvatarUrl
    })

    successMessage.value = 'Avatar mis à jour avec succès !'
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err: any) {
    console.error(err)
    errorMessage.value = err.message || 'Upload échoué'
    // En cas d'erreur, nettoyer le preview
    if (previewAvatar.value) {
      URL.revokeObjectURL(previewAvatar.value)
      previewAvatar.value = ''
    }
  } finally {
    avatarLoading.value = false
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const deleteAvatar = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer votre avatar ?')) return

  avatarLoading.value = true
  errorMessage.value = ''

  try {
    const res = await fetch('/api/user/delete-avatar', { method: 'DELETE' })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || "Erreur lors de la suppression de l'avatar")
    }

    // Mise à jour immédiate de l'UI
    if (store.profile) store.profile.avatar = ''
    edit.avatar = ''
    // Nettoyer tout preview et input
    if (previewAvatar.value) {
      URL.revokeObjectURL(previewAvatar.value)
      previewAvatar.value = ''
    }
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
    successMessage.value = 'Avatar supprimé avec succès !'
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err: any) {
    console.error(err)
    errorMessage.value = err.message || 'Suppression échouée'
  } finally {
    avatarLoading.value = false
  }
}

</script>