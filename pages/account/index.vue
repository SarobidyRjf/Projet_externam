<template>
    <DashboardContent>
      <!-- 🧩 Header -->
      <template #header>
        <div class="flex flex-col gap-1">
          <h2 class="text-2xl font-bold tracking-tight">Liste des utilisateurs</h2>
          <p class="text-sm text-muted-foreground">
            Gérez les comptes utilisateurs enregistrés sur la plateforme.
          </p>
        </div>
      </template>
  
      <!-- 🧭 Contenu -->
      <div class="space-y-6">
        <!-- Barre de recherche et bouton création -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="relative w-full sm:max-w-xs">
            <Input
              v-model="searchTerm"
              type="text"
              placeholder="Rechercher un utilisateur..."
              class="pr-8"
            />
            <button
              v-if="searchTerm"
              type="button"
              class="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
              @click="clearSearch"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>
          <Button
            type="button"
            class="self-start md:self-center"
            @click="openCreateModal"
            >
            + Ajouter un utilisateur
           </Button>
        </div>
  
        <!-- Table -->
        <TableSkeleton v-if="loading && !filteredUsers.length" :rows="6" :show-header="false" />
  
        <DataTable v-else :data="paginatedUsers" :columns="columns">
          <template #nom-data="{ row }">
            <span class="font-medium">{{ row.nom }}</span>
          </template>
          <template #matricule-data="{ row }">
            <span class="font-medium">{{ row.matricule }}</span>
          </template>
          <template #role-data="{ row }">
            <Badge variant="outline" class="capitalize">
              {{
                row?.role && typeof row.role === 'object' && row.role.name
                  ? row.role.name
                  : (row?.role && typeof row.role === 'string'
                      ? (roles.find(r => r._id === row.role)?.name || 'Utilisateur')
                      : (roles.find(r => r._id === row?.role?._id)?.name || row?.metier || 'Utilisateur'))
              }}
            </Badge>
          </template>
          <template #actions-data="{ row }">
            <div class="flex gap-2">
              <Button
                    variant="outline"
                    size="icon"
                    class="h-8 w-8"
                    @click="editUser(row)"
                >
                    <Icon name="lucide:pencil" class="h-4 w-4" />
              </Button>
              <Button
                    variant="outline"
                    size="icon"
                    class="h-8 w-8"
                    @click="deleteUser(row._id)"
                >
                    <Icon name="lucide:trash-2 text-destructive" class="h-4 w-4" />
              </Button>
            </div>
          </template>
        </DataTable>
  
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p class="text-sm text-muted-foreground">
            Page {{ page }} sur {{ totalPages }} — {{ total }} utilisateur{{ total > 1 ? 's' : '' }}
          </p>
          <Pagination :items-per-page="limit" :total="total" :default-page="page">
            <PaginationPrevious @click="page = Math.max(page - 1, 1)">
              <Icon name="lucide:chevron-left" class="h-4 w-4" /> Précédent
            </PaginationPrevious>
            <PaginationItem
              v-for="pageNumber in visiblePages"
              :key="pageNumber"
              :value="pageNumber"
              :is-active="pageNumber === page"
              @click="page = pageNumber"
            >
              {{ pageNumber }}
            </PaginationItem>
            <PaginationNext @click="page = Math.min(page + 1, totalPages)">
              Suivant <Icon name="lucide:chevron-right" class="h-4 w-4" />
            </PaginationNext>
          </Pagination>
        </div>
      </div>
  
      <!-- Modal création / modification -->
      <Dialog v-model:open="showUserModal">
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{{ editUserData?._id ? 'Modifier utilisateur' : 'Créer utilisateur' }}</DialogTitle>
            <DialogDescription>
                Complétez les informations pour {{ editUserData?._id ? 'mettre à jour' : 'ajouter' }} un utilisateur.
            </DialogDescription>
            </DialogHeader>
            <form v-if="editUserData" @submit.prevent="saveUser" class="space-y-4">
            <Input v-model="editUserData.nom" placeholder="Nom" />
            <Input v-model="editUserData.prenom" placeholder="Prénom" />
            <Input v-model="editUserData.matricule" placeholder="Matricule" />
            <Input v-model="editUserData.email" placeholder="Email" />
            <div>
              <label class="text-sm">Rôle</label>
              <Select v-model="editUserData.role">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Choisir un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="r in roles" :key="r._id" :value="r._id">{{ r.name }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input v-if="!editUserData._id" v-model="editUserData.password" placeholder="Mot de passe" type="password" />
            <DialogFooter>
                <DialogClose as-child>
                <button type="button" class="rounded-md px-4 py-2 bg-transparent border border-foreground text-foreground hover:bg-foreground/5 dark:hover:bg-foreground/10 transition-colors">Annuler</button>
                </DialogClose>
                <button type="submit" class="rounded-md px-4 py-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 transition-colors">{{ editUserData?._id ? 'Mettre à jour' : 'Créer' }}</button>
            </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

    </DashboardContent>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import debounce from 'lodash/debounce'
  import { useUserStore } from '@/stores/user'
  import { useRolesStore } from '@/stores/user/roles'
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
  import {
    Pagination,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
  } from '@/components/ui/pagination'

  
  // Auth middleware
  definePageMeta({ middleware: 'auth' })
  
  const userStore = useUserStore()
  const rolesStore = useRolesStore()
  const { users, loading } = storeToRefs(userStore)
  const { roles } = storeToRefs(rolesStore)
  const { getAllUsers } = userStore
  
  // Pagination + recherche
  const searchTerm = ref('')
  const debouncedSearch = ref('')
  const page = ref(1)
  const limit = ref(10)
  const perPageOptions = [10, 20, 50]
  
  const updateSearch = debounce((value: string) => {
    debouncedSearch.value = value
  }, 300)
  
  watch(searchTerm, (value) => {
    updateSearch(value)
    page.value = 1
  })
  
  onMounted(async () => {
    await Promise.all([getAllUsers(), rolesStore.fetchRoles()])
  })
  
  const filteredUsers = computed(() => {
    if (!debouncedSearch.value) return users.value
    const search = debouncedSearch.value.toLowerCase()
    return users.value.filter(
      (u) =>
        u.nom?.toLowerCase().includes(search) ||
        u.prenom?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search)
    )
  })
  
  const total = computed(() => filteredUsers.value.length)
  const totalPages = computed(() => Math.ceil(total.value / limit.value))
  const paginatedUsers = computed(() => {
    const start = (page.value - 1) * limit.value
    return filteredUsers.value.slice(start, start + limit.value)
  })
  
  const visiblePages = computed(() => {
    const pages: number[] = []
    const start = Math.max(page.value - 2, 1)
    const end = Math.min(page.value + 2, totalPages.value)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  })
  
  const clearSearch = () => {
    searchTerm.value = ''
    debouncedSearch.value = ''
  }
  
  // Modal création / modification
  const showUserModal = ref(false)
  const editUserData = ref<any>(null)
  
  const openCreateModal = () => {
    console.log('modal');
    
    // Initialize with role as empty string (Select expects string value)
    editUserData.value = { nom: '', prenom: '', email: '', matricule: '', metier: '', role: '', password: '' }
    showUserModal.value = true
  }
  
  const editUser = (user: any) => {
    // Normalize role to roleId string for the Select component
    const normalizedRole = user?.role && typeof user.role === 'object' ? user.role._id : (user?.role || '')
    editUserData.value = { ...user, role: normalizedRole }
    showUserModal.value = true
  }
  
  const saveUser = async () => {
    if (editUserData.value._id) {
      // Ensure role is an ObjectId string when sending to API
      const payload = { ...editUserData.value }
      if (payload.role && typeof payload.role === 'object') payload.role = payload.role._id
      await userStore.updateUser(editUserData.value._id, payload)
    } else {
      // s'assurer d'envoyer role comme ObjectId via champ role
      const payload = { ...editUserData.value }
      if (payload.role && typeof payload.role === 'object') payload.role = payload.role._id
      await userStore.createUser(payload)
    }
    await getAllUsers()
    showUserModal.value = false
    editUserData.value = null
  }
  
  // Suppression utilisateur
  const deleteUser = async (userId: string) => {
    await userStore.deleteUser(userId)
  }
  
  // Colonnes DataTable
  const columns = [
  { accessorKey: 'nom', header: 'Nom' },
  { accessorKey: 'prenom', header: 'Prénom' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Rôle' },
  { accessorKey: 'matricule', header: 'Matricule' },
  { accessorKey: 'actions', header: 'Actions' }
]


  </script>
  