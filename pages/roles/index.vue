<script setup lang="ts">
/* eslint-disable */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ref, computed, onMounted } from 'vue'
import { useRolesStore } from '~/stores/user/roles'
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import sidebar_groups, { type SidebarGroup, type SidebarLink } from '~/constants/sidebar_links'

// Auth middleware
definePageMeta({ middleware: 'auth' })

type Permission = { action: string; subject: string; conditions?: Record<string, any> | null }

const rolesStore = useRolesStore()
const { roles, loading } = storeToRefs(rolesStore)

const authStore = useAuthStore()
const { ability } = storeToRefs(authStore)

const canManage = computed(() => ability.value?.can('manage', 'all') || ability.value?.can('manage', 'Role') || false)
const canAssign = computed(() => ability.value?.can('manage', 'all') || ability.value?.can('update', 'User') || false)

onMounted(() => {
  rolesStore.fetchRoles()
  fetchUsers()
  const canRead = ability.value?.can('manage', 'all') || ability.value?.can('read', 'Role')
  if (!canRead) {
    navigateTo('/403')
  }
})

// UI state for create role (side card like the screenshot)
const newRoleName = ref('')
const selectedSubject = ref<string>('')
// Sous-menus disponibles pour le subject sélectionné
const availableSubmenus = computed(() => {
  if (!selectedSubject.value) return [] as { title: string; subject?: string; availableActions?: string[] }[]
  const submenus: { title: string; subject?: string; availableActions?: string[] }[] = []
  sidebar_groups.forEach(group => {
    (group.links || []).forEach(link => {
      const linkSubjects = Array.isArray(link.subject) ? link.subject : link.subject ? [link.subject] : []
      const hasSubject = linkSubjects.includes(selectedSubject.value)
      if (hasSubject && Array.isArray(link.items)) {
        link.items.forEach(sub => {
          submenus.push({ title: sub.title, subject: sub.subject, availableActions: sub.availableActions })
        })
      }
    })
  })
  return submenus
})

// Sous-menus cochés par l'admin
const checkedSubmenus = ref<Record<string, boolean>>({})

// Catalogue d'actions par défaut (si non défini dans le menu)
const DEFAULT_AVAILABLE_ACTIONS = ['read', 'create', 'update', 'delete', 'publish', 'search']

// Actions sélectionnées par sous-menu
const selectedActionsBySubmenu = ref<Record<string, Set<string>>>({})

function toggleSubmenuChecked(title: string, checked: boolean) {
  checkedSubmenus.value = { ...checkedSubmenus.value, [title]: checked }
  if (checked && !selectedActionsBySubmenu.value[title]) {
    selectedActionsBySubmenu.value[title] = new Set()
  }
  if (!checked) {
    delete selectedActionsBySubmenu.value[title]
  }
}
const allowRead = ref(false)
const allowWrite = ref(false)
const allowUpdate = ref(false)
const allowDelete = ref(false)
const allowPublish = ref(false)

// Options de sujets basées sur la config du sidebar (et sujets système)
const availableSubjects = computed<string[]>(() => {
  const subjects = new Set<string>()
  sidebar_groups.forEach(group => {
    (group.links || []).forEach(link => {
      if (link.subject) {
        if (Array.isArray(link.subject)) link.subject.forEach(s => subjects.add(s))
        else subjects.add(link.subject as string)
      }
    })
  })
  subjects.add('Role')
  subjects.add('User')
  return Array.from(subjects)
})

function buildPermissionsFromFlags(): Permission[] {
  const permissions: Permission[] = []
  const subject = selectedSubject.value || 'all'

  // Permissions directes au niveau du subject (global module)
  if (allowRead.value) permissions.push({ action: 'read', subject })
  if (allowWrite.value) permissions.push({ action: 'create', subject })
  if (allowUpdate.value) permissions.push({ action: 'update', subject })
  if (allowDelete.value) permissions.push({ action: 'delete', subject })
  if (allowPublish.value) permissions.push({ action: 'publish', subject })

  // Permissions fines par sous-menu sélectionné
  availableSubmenus.value.forEach(sub => {
    if (!checkedSubmenus.value[sub.title]) return
    const actions = Array.from(selectedActionsBySubmenu.value[sub.title] || [])
    const subSubject = sub.subject || subject
    actions.forEach(action => permissions.push({ action, subject: subSubject }))
  })

  return permissions
}

async function createRole() {
  if (!newRoleName.value.trim()) return
  const permissions = buildPermissionsFromFlags()
  await rolesStore.createRole({ name: newRoleName.value.trim(), permissions })
  newRoleName.value = ''
  selectedSubject.value = ''
  allowRead.value = allowWrite.value = allowUpdate.value = allowDelete.value = allowPublish.value = false
  checkedSubmenus.value = {}
  selectedActionsBySubmenu.value = {}
}

// Edit role modal state and handlers
const editOpen = ref(false)
const editRoleId = ref<string | null>(null)
const editName = ref('')
const editPermissions = ref<Permission[]>([])
const ACTIONS = ['read','create','update','delete','publish']

function openEdit(roleId: string) {
  const r = roles.value.find(r => r._id === roleId)
  if (!r) return
  editRoleId.value = roleId
  editOpen.value = true
  editName.value = r.name
  editPermissions.value = JSON.parse(JSON.stringify(r.permissions || []))
}

async function saveEdit() {
  if (!editRoleId.value) return
  await rolesStore.updateRole(editRoleId.value, { name: editName.value, permissions: editPermissions.value })
  editOpen.value = false
  editRoleId.value = null
}

async function removeRole(id: string) {
  await rolesStore.deleteRole(id)
}

// User assignment
type BasicUser = { _id: string; email?: string; nom?: string; prenom?: string }
const users = ref<BasicUser[]>([])
const selectedUserId = ref<string>('')
const selectedRoleId = ref<string>('')

async function fetchUsers() {
  try {
    const res = await $fetch<BasicUser[]>('/api/user/all')
    users.value = res
  } catch {
    // ignore
  }
}

async function assignRole() {
  if (!selectedUserId.value || !selectedRoleId.value) return
  await rolesStore.assignUserRole(selectedUserId.value, selectedRoleId.value)
  selectedUserId.value = ''
  selectedRoleId.value = ''
}

function roleDescription(perms: Permission[]) {
  const hasAll = perms.some(p => p.action === 'manage' && p.subject === 'all')
  if (hasAll) return "Accès complet à toutes fonctionnalités."
  const canWrite = perms.some(p => p.action === 'create')
  const canRead = perms.some(p => p.action === 'read')
  const canDelete = perms.some(p => p.action === 'delete')
  if (canWrite) return 'Peut modifier le contenu.'
  if (canRead && !canWrite) return 'Accès en lecture seule.'
  if (canDelete) return 'Peut supprimer du contenu.'
  return 'Permissions personnalisées.'
}
</script>

<template>
  <div class="space-y-6 p-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold tracking-tight">Gestion des rôles et accès</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <Card>
      <CardHeader>
        <CardTitle>Rôles</CardTitle>
        <CardDescription>Liste des rôles existants et permissions associées.</CardDescription>
      </CardHeader>
      <CardContent>
          <div v-if="loading" class="py-10 text-center text-sm text-muted-foreground">Chargement…</div>
          <div v-else class="grid md:grid-cols-2 gap-4">
            <div v-for="role in roles" :key="role._id" class="border rounded-md p-4">
              <div class="flex items-center justify-between">
                <div class="font-medium">{{ role.name }}</div>
                <div class="flex gap-2" v-if="canManage">
                  <Button size="sm" variant="secondary" @click="openEdit(role._id)">Modifier</Button>
                  <Button size="sm" variant="destructive" @click="removeRole(role._id)">Supprimer</Button>
                </div>
              </div>
              <p class="text-sm text-muted-foreground mt-1">{{ roleDescription(role.permissions) }}</p>
              <div class="mt-2 space-y-2">
                <div class="text-xs text-muted-foreground">Actions autorisées (tous sujets confondus)</div>
                <div class="flex flex-wrap gap-2">
                  <Badge v-for="(perm, i) in role.permissions" :key="i" variant="secondary">
                    {{
                      perm.action === 'read' ? 'Lire' :
                      perm.action === 'create' ? 'Écrire' :
                      perm.action === 'update' ? 'Mettre à jour' :
                      perm.action === 'delete' ? 'Supprimer' :
                      perm.action === 'publish' ? 'Publier' : perm.action
                    }}
                    <span class="ml-1 opacity-70">({{ perm.subject }})</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
      </CardContent>
        </Card>

        <Card v-if="canAssign">
      <CardHeader>
        <CardTitle>Affecter un rôle à un utilisateur</CardTitle>
        <CardDescription>Mettre à jour le rôle d'un utilisateur existant.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <label class="text-sm">Utilisateur</label>
            <Select v-model="selectedUserId">
              <SelectTrigger class="w-full truncate">
                <SelectValue placeholder="Choisir un utilisateur" class="truncate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="u in users" :key="u._id" :value="u._id">{{ u.email }} - {{ u.nom || '' }} {{ u.prenom || '' }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="text-sm">Rôle</label>
            <Select v-model="selectedRoleId">
              <SelectTrigger class="w-full truncate">
                <SelectValue placeholder="Choisir un rôle" class="truncate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="r in roles" :key="r._id" :value="r._id">{{ r.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-end">
            <Button class="w-full" @click="assignRole">Affecter</Button>
          </div>
        </div>
        </CardContent>
        </Card>
      </div>

      <div class="space-y-4">
        <Card v-if="canManage">
          <CardHeader>
            <CardTitle>Ajouter un rôle</CardTitle>
            <CardDescription>Définissez rapidement un nouveau rôle.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-sm">Nom du rôle</label>
              <Input v-model="newRoleName" placeholder="Admin, Éditeur, Utilisateur..." />
            </div>
            <div>
              <label class="text-sm">Sujet (module)</label>
              <Select v-model="selectedSubject">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Choisir un sujet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="s in availableSubjects" :key="s" :value="s">{{ s }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div v-if="selectedSubject" class="space-y-2">
              <div class="text-sm font-medium">Sous-menus liés</div>
              <div class="space-y-2">
                <div v-for="sub in availableSubmenus" :key="sub.title" class="border rounded-md p-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <Checkbox :checked="!!checkedSubmenus[sub.title]" @update:checked="(v:boolean)=>toggleSubmenuChecked(sub.title,v)" />
                      <span class="font-medium">{{ sub.title }}</span>
                    </div>
                  </div>
                  <div v-if="checkedSubmenus[sub.title]" class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                    <template v-for="action in (sub.availableActions && sub.availableActions.length ? sub.availableActions : DEFAULT_AVAILABLE_ACTIONS)" :key="action">
                      <label class="inline-flex items-center gap-2 text-sm">
                        <Checkbox :checked="selectedActionsBySubmenu[sub.title]?.has(action)"
                          @update:checked="(v:boolean)=>{
                            if(!selectedActionsBySubmenu[sub.title]) selectedActionsBySubmenu[sub.title]= new Set();
                            if(v) selectedActionsBySubmenu[sub.title].add(action); else selectedActionsBySubmenu[sub.title].delete(action)
                          }" />
                        <span>{{ action }}</span>
                      </label>
                    </template>
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-2" v-if="selectedSubject">
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="allowRead" />
                <span>Lire (sur le module)</span>
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="allowWrite" />
                <span>Écrire (sur le module)</span>
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="allowUpdate" />
                <span>Mettre à jour (sur le module)</span>
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="allowDelete" />
                <span>Supprimer (sur le module)</span>
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="allowPublish" />
                <span>Publier (sur le module)</span>
              </div>
            </div>
            <Separator />
            <div class="flex justify-end">
              <Button @click="createRole">Créer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <Dialog v-model:open="editOpen">
      <DialogContent class="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Modifier le rôle</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <label class="text-sm">Nom du rôle</label>
            <Input v-model="editName" />
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Permissions</span>
              <Button size="sm" variant="secondary" @click="editPermissions.push({action:'read',subject:selectedSubject || availableSubjects[0] || 'all',conditions:null})">Ajouter</Button>
            </div>
            <div class="space-y-3">
              <div v-for="(perm, idx) in editPermissions" :key="idx" class="grid grid-cols-3 gap-2">
                <Select v-model="perm.action">
                  <SelectTrigger>
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="a in ACTIONS" :key="a" :value="a">{{ a }}</SelectItem>
                  </SelectContent>
                </Select>
                <Select v-model="perm.subject">
                  <SelectTrigger>
                    <SelectValue placeholder="Sujet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="s in availableSubjects" :key="s" :value="s">{{ s }}</SelectItem>
                  </SelectContent>
                </Select>
                <div class="flex gap-2">
                  <Button size="sm" variant="destructive" @click="editPermissions.splice(idx,1)">Retirer</Button>
                </div>
              </div>
            </div>
          </div>
          <Separator />
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="editOpen=false">Annuler</Button>
            <Button @click="saveEdit">Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>


