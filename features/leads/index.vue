<template>
    <DashboardContent>
        <template #header>
            <h2 class="text-2xl font-bold tracking-tight">
                Mes Leads
            </h2>
        </template>

        <DetailsDrawer
          direction="right"
          v-model:open="showDrawer"
          :title="'Détails du Lead'"
          :description="'Informations complètes'"
        >
        <div v-if="selectedLead" class="flex justify-end mb-4 absolute top-[15px] right-3">
          <Button
            variant="outline"
            size="sm"
            class="flex items-center gap-2"
            @click="openLeadDialog(selectedLead)"
          >
            <Icon
              v-if="isCommercial"
              name="lucide:pencil"
              class="h-4 w-4"
            />
            {{ drawerActionLabel }}
          </Button>
        </div>
        <div class="space-y-2">
          <h1 class="text-center font-bold "><Badge variant="outline" class="bg-orange-50 text-orange-400 border-orange-100">Informations du Lead</Badge></h1>
          <div class="grid grid-cols-1 md:grid-cols-2 space-y-3">
            <p v-if="!selectedLead?.nom && !selectedLead?.prenom"><strong>Nom et Prénom :</strong> {{ selectedLead?.full_name }}</p>
            <p v-if="selectedLead?.nom"><strong>Nom :</strong> {{ selectedLead?.nom }} </p>
            <p v-if="selectedLead?.prenom"><strong>Prénom :</strong> {{ selectedLead?.prenom }}</p>
            <p><strong>Email :</strong> {{ selectedLead?.email }}</p>
            <p><strong>Téléphone :</strong> {{ selectedLead?.phone_number }}</p>
            <p><strong>Status :</strong> {{ selectedLead?.status }}</p>
            <p><strong>Objectif du client :</strong> {{ selectedLead?.objectif_client }}</p>
          </div>
        </div>
        <hr>
        <div class="space-y-2">
          <h1 class="text-center font-bold text-orange-400">
            <Badge variant="outline" class="bg-orange-50 text-orange-400 border-orange-100">Informations de la société</Badge>
          </h1>
          <div class="grid grid-cols-1 md:grid-cols-2 space-y-3">
            <p><strong>Nom de la societe :</strong> {{ selectedLead?.nom_societe }}</p>
            <p><strong>Adresse de la societe :</strong> {{ selectedLead?.localisation_societe}}</p>
            <p><strong>Activité de la societe :</strong> {{ selectedLead?.fonction }}</p>
            <p><strong>Panier :</strong> {{ selectedLead?.panier }}</p>
            <p><strong>Domaine :</strong> {{ selectedLead?.domaine }}</p>
            <p><strong>Chiffre d'affaire :</strong> {{ selectedLead?.chiffre_affaire }}</p>
            <p><strong>Lieu de vente :</strong> {{ selectedLead?.lieu_vente }}</p>
            <p><strong>Date de création :</strong> {{ selectedLead?.date_creation ? formatDate(selectedLead?.date_creation ?? "") : '' }}</p>
            <p><strong>Resultat net :</strong> {{ selectedLead?.resultat_net }}</p>
            <p><strong>Produit vendu :</strong> {{ selectedLead?.produit_vendu }}</p>
            <p><strong>Taille de l'entreprise :</strong> {{ selectedLead?.taille_entreprise }}</p>
            <p><strong>Tarif prestation :</strong> {{ selectedLead?.tarif_prestation }}</p>
          </div>
          
        </div>
        <hr>
        <div class="space-y-2">
          <h1 class="text-center font-bold text-orange-400">
            <Badge variant="outline" class="bg-orange-50 text-orange-400 border-orange-100">Informations marketing</Badge>
          </h1>
          <p><strong>Canaux marketing :</strong> {{ selectedLead?.canaux_marketing }}</p>
          <div class="flex flex-wrap flex-row gap-4">
            <div v-if="selectedLead?.lien_insta" class="flex flex-row items-center">
            <Icon name="lucide:instagram" size="15" class="w-4 h-4 mr-1" />
              <a class="hover:underline hover:text-blue-400" :href="selectedLead?.lien_insta?.startsWith('http')
                  ? selectedLead.lien_insta
                  : `https://${selectedLead?.lien_insta}`"
                target="_blank"
                rel="noopener noreferrer"
              >{{ selectedLead?.lien_insta }}</a>
            </div>
            <div v-if="selectedLead?.lien_fb" class="flex flex-row items-center">
              <Icon name="lucide:facebook" size="15" class="w-4 h-4 mr-1" />
              <a class="hover:underline hover:text-blue-400" :href="selectedLead?.lien_fb?.startsWith('http')
                  ? selectedLead.lien_fb
                  : `https://${selectedLead?.lien_fb}`"
                target="_blank"
                rel="noopener noreferrer"
              >{{ selectedLead?.lien_fb }}</a>
            </div>
            <div v-if="selectedLead?.lien_tiktok" class="flex flex-row items-center">
              <Icon name="hugeicons:tiktok" size="15" class="w-4 h-4 mr-1" />
              <a class="hover:underline hover:text-blue-400" :href="selectedLead?.lien_tiktok?.startsWith('http')
                  ? selectedLead.lien_tiktok
                  : `https://${selectedLead?.lien_tiktok}`"
                target="_blank"
                rel="noopener noreferrer"
              >{{ selectedLead?.lien_tiktok }}</a>
            </div>
            <div v-if="selectedLead?.lien_linkedin" class="flex flex-row items-center">
              <Icon name="lucide:linkedin" size="15" class="w-4 h-4 mr-1" />
              <a class="hover:underline hover:text-blue-400" :href="selectedLead?.lien_linkedin?.startsWith('http')
                  ? selectedLead.lien_linkedin
                  : `https://${selectedLead?.lien_linkedin}`"
                target="_blank"
                rel="noopener noreferrer"
              >{{ selectedLead?.lien_linkedin }}</a>
            </div>
            <div v-if="selectedLead?.lien_siteweb" class="flex flex-row items-center">
              <Icon name="lucide:globe" size="15" class="w-4 h-4 mr-1" />
              <a class="hover:underline hover:text-blue-400" :href="selectedLead?.lien_siteweb?.startsWith('http')
                  ? selectedLead.lien_siteweb
                  : `https://${selectedLead?.lien_siteweb}`"
                target="_blank"
                rel="noopener noreferrer"
              >{{ selectedLead?.lien_siteweb }}</a>
            </div>
          </div>
        </div>
        <hr>
        <div class="space-y-2">
          <h1 class="text-center font-bold text-orange-400">
            <Badge variant="outline" class="bg-orange-50 text-orange-400 border-orange-100">Informations du Rendez-vous</Badge>
          </h1>
          <p><strong>Date et heure du rendez-vous :</strong> {{ selectedLead?.date_rdv ? formatDateTime(selectedLead?.date_rdv ?? "") : '' }}</p>
          <p><strong>Type de rendez-vous :</strong> {{ formatRdvType(selectedLead?.type_lieu_rdv) }}</p>
          <p><strong>Lieu du rendez-vous :</strong> {{ selectedLead?.lieu_rdv }}</p>
        </div>
        <hr>
        <div class="space-y-2">
          <h1 class="text-center font-bold text-orange-400">
            <Badge variant="outline" class="bg-orange-50 text-orange-400 border-orange-100">Autres</Badge>
          </h1>
          <p><strong>Commentaire :</strong> {{ selectedLead?.commentaire }}</p>
          <div v-if="selectedLead?.note_R1" class="flex flex-row gap-2">
            <strong>Note R1 :</strong> 
            <div v-html="selectedLead?.note_R1"></div>
          </div>
          <div v-if="selectedLead?.note_R2" class="flex flex-row gap-2">
            <strong>Note R2 :</strong>
            <span v-html="selectedLead?.note_R2"></span>
          </div>

          <div v-if="selectedLead?.note_R3" class="flex flex-row gap-2">
            <strong>Note R3 :</strong>
            <span v-html="selectedLead?.note_R3"></span>
          </div>

          <div v-if="selectedLead?.note_RDV_strategique" class="flex flex-row gap-2">
            <strong>Note RDV stratégique :</strong>
            <span v-html="selectedLead?.note_RDV_strategique" class="flex flex-row gap-2"></span>
          </div>

          <div v-if="selectedLead?.note_paiements" class="flex flex-row gap-2">
            <strong>Note paiement :</strong>
            <span v-html="selectedLead?.note_paiements"></span>
          </div>

        </div>
        </DetailsDrawer>

        <InformationLead v-model:open="editDialog" :lead="selectedLead" />

        <div class="flex flex-row gap-4 flex-wrap">
          <div class="flex items-center gap-2 relative">
            <Input class="w-[100%]" v-model="searchTerm" placeholder="Rechercher..." />
            <span @click="clearSearch()" class="absolute end-0 inset-y-0 flex items-center justify-center px-2 cursor-pointer">
              <Icon name="lucide:x" class="w-4 h-4 text-gray-400" />
            </span>
          </div>

          <div class="flex items-center gap-2">
            <Select v-model="selectedChiffreAffaire" class="w-full">
              <SelectTrigger>
                <SelectValue placeholder="Chiffre d'affaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">Tous</SelectItem>
                <SelectItem v-for="(opt,i) in chiffreAffaireOptions" :key="i" :value="opt">
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-center gap-2">
            Filtrer par niveau prospect :
            <Select v-model="selectedProspectLevel" class="w-full">
              <SelectTrigger>
                <SelectValue placeholder="Niveau prospect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">Tous</SelectItem>
                <SelectItem :value="1">Niveau 1</SelectItem>
                <SelectItem :value="2">Niveau 2</SelectItem>
                <SelectItem :value="3">Niveau 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-center gap-2">
            Filtrer par région :
            <Select v-model="selectedRegion" class="w-full">
              <SelectTrigger>
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">Tous</SelectItem>
                <SelectItem v-for="reg in regions" :key="reg.code" :value="reg.code">
                  {{ reg.nom }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-center gap-2">
            Filtrer par département :
            <Select v-model="selectedDepartment" class="w-full">
              <SelectTrigger>
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">Tous</SelectItem>
                <SelectItem v-for="dept in departments" :key="dept.code" :value="dept.code">
                  {{ dept.nom }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-row gap-2 items-center">
            Filtrer par status :
            <div class="grid grid-cols-1">
                  <div class="flex flex-row items-center gap-1">
                    <Popover>
                      <PopoverTrigger as-child>
                        <Button variant="outline">
                          Type de lead
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="grid grid-cols-1 gap-2">
                        <div class="flex items-center gap-2" v-for="(opt,i) in statusFilter" :key="i">
                          <Checkbox
                            :id="opt.value"
                            :model-value="selectedStatus.includes(opt.value)"
                            @update:model-value="(val)=> toggleStatus(!!val, opt.value)"
                          />
                          <Label :for="opt.value">{{ opt.label }}</Label>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <div class="flex gap-2">
                        <Badge v-for="(statusSelected, i) of selectedStatus" :key="i"
                          variant="secondary"
                          class="flex items-center gap-1"
                        >
                          {{ statusSelected }}
                          <button @click="removeStatus(statusSelected)"
                            class="ml-1 text-gray-500 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </Badge>
                      </div>
                  </div>
            </div>
          </div>
        </div>
    
    <div class="w-full space-y-4">
        <DataTable :data="leadByUser" :columns="leadsColumns"  @row-click="openDrawer">
          <template #assigned_to_user-data="{ row }">
            <span class="text-zinc-400">
              {{ formatAssignedUsers(row.assigned_to_user) || 'Non assigné' }}
            </span>
          </template>
          <template #date_rdv-data="{ row }">
            <span v-if="row.date_rdv" class="">{{ formatDate(row.date_rdv) }}</span>
          </template>
          <template #niveau_prospect-data="{ row }">
              <div class="flex justify-center">
                <span class="inline-flex items-center"
                      :class="{'bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full': row.detailrdv?.niveau_prospect === 1,
                              'bg-yellow-100 text-yellow-600 px-2.5 py-1 rounded-full': row.detailrdv?.niveau_prospect === 2,
                              'bg-green-100 text-green-600 px-2.5 py-1 rounded-full': row.detailrdv?.niveau_prospect === 3 }"
                >
                {{ row.detailrdv?.niveau_prospect }}
                </span>
              </div>
          </template>
          <template #chiffre_affaire-data="{row}">
            <span v-if="row.chiffre_affaire" class="">{{ formatChiffreAffaire(row.chiffre_affaire) }}</span>
          </template>
          <template #status-data="{ row }">
            <div>
              <Badge 
                variant="outline" 
                :class="{
                  'bg-cyan-50 text-cyan-400 border-cyan-100': row.status === 'RDV',
                  'bg-yellow-50 text-yellow-400 border-yellow-100': row.status === 'Nouveau lead',
                  'bg-green-50 text-green-400 border-green-100': row.status === 'Paiement',
                  'bg-purple-50 text-purple-400 border-purple-100': row.status === 'Devis',
                  'bg-orange-50 text-orange-400 border-orange-100': row.status === 'Closing',
                  'bg-pink-50 text-pink-400 border-pink-100': row.status === 'RDV stratégique',
                  'bg-indigo-50 text-indigo-400 border-indigo-100': row.status === 'marketing',
                  'bg-gray-50 text-gray-400 border-gray-100': row.status === 'montage',
                  'bg-red-50 text-red-400 border-red-100': row.status === 'Hors cible',
                  'bg-blue-50 text-blue-400 border-blue-100': row.status === 'Facture',
                  
                }"
                >
                <template v-if="row.status === 'Nouveau lead'">
                  <Icon name="lucide:loader" class="w-4 h-4 mr-1" />
                </template>
                <template v-if="row.status === 'RDV'">
                  <Icon name="lucide:calendar-check" class="w-4 h-4 mr-1" />
                </template> 
                <template v-if="row.status === 'Paiement'">
                  <Icon name="lucide:credit-card" class="w-4 h-4 mr-1" />
                </template>
                <template v-if="row.status === 'Devis'">
                  <Icon name="lucide:file-text" class="w-4 h-4 mr-1" />
                </template>
                <template v-if="row.status === 'Closing'">
                  <Icon name="lucide:panel-right-close" class="w-4 h-4 mr-1" />
                </template>
                <template v-if="row.status === 'RDV stratégique'">
                  <Icon name="lucide:calendar-check" class="w-4 h-4 mr-1" />
                </template>
                <template v-if="row.status === 'marketing'">
                  <Icon name="lucide:chart-column" class="w-4 h-4 mr-1" />
                </template>
                <template v-if="row.status === 'montage'">
                  <Icon name="lucide:square-play" class="w-4 h-4 mr-1" />
                </template>
                <template v-if="row.status === 'Hors cible'">
                  <Icon name="lucide:square-x" class="w-4 h-4 mr-1" />
                </template>
                <template v-if="row.status==='Facture' ">
                  <Icon name="lucide:file-text" class="w-4 h-4 mr-1" />
                </template>
                
                {{ row.status }}
               </Badge>
            </div>
          </template>
          <template #actions-data="{ row }">
            <div class="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                class="h-8 w-8 p-0"
                title="Éditer Lead"
                @click="onEditClick($event, row)"
              >
                <Icon name="lucide:pencil" class="h-3.5 w-3.5" />
              </Button>
            </div>
            </template>
        </DataTable>
        <div class="flex items-center justify-between mb-2">
  <!-- Dropdown pour le nombre de lignes -->
            <div class="flex items-center gap-2">
              <label for="perPage" class="text-sm">Lignes par page :</label>
              <select id="perPage" v-model="limit" class="border rounded-md px-2 py-2 text-sm">
                <option v-for="opt in perPageOptions" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </div>
            <!-- Pagination -->
            <Pagination v-if="totalPages > 1" :items-per-page="limit" :total="totalmanage" :default-page="page">
              <PaginationPrevious @click="page = Math.max(page - 1, 1)">
                <Icon name="lucide:chevron-left" />
                Précedent
              </PaginationPrevious>
              <PaginationItem
                v-for="p in visiblePages"
                :key="p"
                :value="p"
                :is-active="p === page"
                @click="page = p"
              >
                {{ p }}
              </PaginationItem>
              <PaginationEllipsis :index="7" />
              <PaginationNext @click="page = Math.min(page + 1, totalPages)">
                Suivant
                <Icon name="lucide:chevron-right" />
              </PaginationNext>
            </Pagination>
        </div>
    </div>
    </DashboardContent>
</template>

<script setup lang="ts">
import type { ColumnDefProps } from '@/components/ui/data-table/DataTable.vue';
import { useAuthStore } from '~/stores/auth';
import { useLeadsStore } from '~/stores/leads';
import DetailsDrawer from "@/features/leads/components/DetailsLeads.vue";
import InformationLead from './components/information-lead/InformationLead.vue';
import { useFormatDateTime, useDateFormat, useFormatChiffreAffaire  } from '@/composables/formatData';
import debounce from 'lodash/debounce'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RDV_TYPE_LABELS } from '~/constants/rdvTypes';

definePageMeta({
  middleware: "auth",
});

const { formatDateTime } = useFormatDateTime();
const { formatDate } = useDateFormat();
const { formatChiffreAffaire } = useFormatChiffreAffaire();

const formatRdvType = (type?: string | null) => {
  if (!type) return '';
  return RDV_TYPE_LABELS[type] ?? type;
};

const formatAssignedUsers = (users?: Array<{ _id: string; nom?: string; prenom?: string }>) => {
  if (!Array.isArray(users) || users.length === 0) {
    return '';
  }

  return users
    .map((user) => {
      const fullName = [user?.prenom, user?.nom].filter(Boolean).join(' ').trim();
      return fullName || user?._id || 'Utilisateur';
    })
    .filter(Boolean)
    .join(', ');
};

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  status: string;
  assigned_to_user?: Array<{
    _id: string;
    nom?: string;
    prenom?: string;
  }>;
  nom: string;
  prenom: string;
  objectif_client: string;
  nom_societe?: string;
  localisation_societe: string;
  panier: string;
  chiffre_affaire: string;
  fonction: string;
  domaine: string;
  date_creation: string;
  lieu_vente: string;
  resultat_net: string;
  produit_vendu: string;
  taille_entreprise: string;
  tarif_prestation: string;
  type_lieu_rdv?: string | null;
  lieu_rdv: string | null;
  date_rdv: string;
  canaux_marketing: string;
  lien_fb: string;
  lien_insta: string;
  lien_tiktok: string;
  lien_linkedin: string;
  lien_siteweb: string;
  commentaire: string;
  note_R1: string;
  date_rdv_R1?: string | Date | null;
  note_R2: string;
  date_rdv_R2?: string | Date | null;
  note_R3: string;
  note_RDV_strategique: string;
  date_rdv_RDVstat?: string | Date | null;
  note_paiements: string;
  date_rdv_paiement?: string | Date | null;
}

const { userConnected, ability } = storeToRefs(useAuthStore());
const { getLeadsByUser } = useLeadsStore()

const { leadByUser, totalmanage } = storeToRefs(useLeadsStore());

const page = ref(1);
const limit = ref(20);
const perPageOptions = [20, 40, 50]
const searchTerm = ref('')
const debounceSearch = ref('')
const selectedChiffreAffaire = ref<any>(null)
const selectedProspectLevel = ref<number | null>(null)
const selectedRegion = ref<string | null>(null)
const selectedDepartment = ref<string | null>(null)
const regions = ref<{ code: string; nom: string }[]>([])
const departments = ref<{ code: string; nom: string }[]>([])

const chiffreAffaireOptions = [
  { label: "Moins de 2000 €", min: 0, max: 2000, unite: "euro" },
  { label: "entre 2000 € et 10000 € ", min: 2000, max: 10000, unite: "euro" },
  { label: "entre 20 000 € et 50 000 €", min: 20000, max: 50000, unite: "euro" },
  { label: "entre 50 000 € et 100 000 €", min: 50000, max: 100000, unite: "euro" },
  { label: "plus de 100 000 €", min: 100000, max: 1000000, unite: "euro" },
  { label: "moin de 400 millions d'Ariary", min: 0, max: 400000000, unite: "ariary" },
  { label: "entre 400 et 600 millions d'Ariary", min: 400000000, max: 600000000, unite: "ariary" },
  { label: "plus de 1 milliard d'Ariary", min: 1000000000, max: 2000000000, unite: "ariary" },
]

const updateSearch = debounce((val: string) => {
  debounceSearch.value = val
}, 300)

const clearSearch = () => {
  searchTerm.value = ''
  updateSearch('')
}

const totalPages = computed(() => Math.ceil(totalmanage.value / limit.value))

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(page.value - 2, 1)
  const end = Math.min(page.value + 2, totalPages.value)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const selectedStatus = ref<string[]>([])

const statusFilter = ref([
  {
    label: "Tous",
    value: "",
  },
  {
    label: "Nouveau Lead",
    value: "Nouveau lead",
  },
  {
    label: "RDV",
    value: "RDV",
  },
  {
    label: "Paiement",
    value: "Paiement",
  },
  {
    label: "Devis",
    value: "Devis",
  },
  {
    label: "Closing",
    value: "Closing",
  },
  {
    label: "RDV stratégique",
    value: "RDV stratégique",
  },
  {
    label: "Marketing",
    value: "marketing",
  },
])

const toggleStatus = (val: boolean, value: string) => {
  console.log(val,value,'f')
  if (val) {
    if (!selectedStatus.value.includes(value)) {
      selectedStatus.value = [...selectedStatus.value, value] 
    }
  } else {
    selectedStatus.value = selectedStatus.value.filter(s => s !== value)
  }
}

const removeStatus = (status: string) => {
  selectedStatus.value = selectedStatus.value.filter(s => s !== status)
}


watch(searchTerm, (val) => updateSearch(val))
watch([page, limit, selectedStatus, debounceSearch, selectedChiffreAffaire, selectedProspectLevel, selectedDepartment, selectedRegion], () => {
  const caMin = selectedChiffreAffaire.value?.min
  const caMax = selectedChiffreAffaire.value?.max
  const unite = selectedChiffreAffaire.value?.unite
  getLeadsByUser(
    userConnected.value._id,
    page.value,
    limit.value,
    selectedStatus.value,
    debounceSearch.value,
    caMin,
    caMax,
    unite,
    selectedProspectLevel.value ?? undefined,
    selectedDepartment.value ?? undefined,
    selectedRegion.value ?? undefined
  )
}, { deep: true })

const allColumns = ref<ColumnDefProps[]>([
  {
    id: "select",
    enableAllPageRowsSelected: true,
    enableRowSelection: true,
  },
  {
    accessorKey: "assigned_to_user",
    header: "Assigné à",
    meta: { title: "Assigné à" },
    enableSorting: true,
    showIf: (role) => role === 'super_admin',
    cell: ({ row }: { row: { original: Lead } }) => {
      return formatAssignedUsers(row.original.assigned_to_user);
    }
  },
  {
    accessorKey: "full_name",
    header: "Nom",
    meta: { title: "Nom et Prénom" },
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: "Email", 
    meta: { title: "Email" },
    enableSorting: true,
  },
  {
    accessorKey: "niveau_prospect",
    header: "Niveau qualification prospect", 
    meta: { title: "Niveau qualification prospect" },
    enableSorting: true,
  },
  {
    accessorKey: "chiffre_affaire",
    header: "Chiffre d'affaire",
    meta: { title: "Chiffre d'affaires" },
    enableSorting: true,
   },
  {
    accessorKey: "phone_number",
    header: "Phone",
    meta: { title: "Téléphone" },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { title: "Status" },
    enableSorting: true,
  },
  {
    accessorKey: "date_rdv",
    header: "Date de RDV",
    meta: { title: "Date de rendez-vous" },
    enableSorting: true,
  },
  {
    accessorKey: "type_lieu_rdv",
    header: "Type RDV",
    meta: { title: "Type de rendez-vous" },
    enableSorting: true,
    cell: ({ row }: { row: { original: Lead } }) => formatRdvType(row.original.type_lieu_rdv),
  },
  {
    accessorKey: "lieu_rdv",
    header: "Lieu RDV",
    meta: { title: "Lieu RDV" },
    enableSorting: true,
  },
  {
    accessorKey: "actions",
    header: "Actions",
    meta: { title: "Actions" },
    enableSorting: false,
    showIf: (role) => role !== 'super_admin',
  },
  
]);

const leadsColumns = computed(() => {
  if(!userConnected.value) return []
  const role = userConnected?.value.role?.name || ''

  return allColumns.value.filter((col) => {
    return typeof col.showIf === 'function' ? col.showIf(role) : true
  })
})

const showDrawer = ref(false)
const selectedLead = ref(null as Lead | null)
const editDialog = ref(false)

const roleName = computed(() => userConnected.value?.role?.name ?? '')
const isCommercial = computed(() => roleName.value === 'commercial')
const isManager = computed(() => roleName.value === 'super_admin' || roleName.value === 'responsable_commercial')
const drawerActionLabel = computed(() => (isManager.value ? 'Modifier' : 'Modifier'))

const openDrawer = (row: Record<string, any>) => {
  selectedLead.value = row as Lead
  showDrawer.value = true
}

const openLeadDialog = (lead?: Lead | null) => {
  if (!lead) return
  selectedLead.value = lead
  editDialog.value = true
}

const onEditClick = (e: Event | null, row: Record<string, any>) => {
  e?.stopPropagation()
  openLeadDialog(row as Lead)
}

onMounted(async () => {
  await getLeadsByUser(userConnected.value._id);
  try {
    const regs = await $fetch('https://geo.api.gouv.fr/regions')
    regions.value = regs as { code: string; nom: string }[]
    const deps = await $fetch('https://geo.api.gouv.fr/departements')
    departments.value = deps as { code: string; nom: string }[]
  } catch (err) {
    console.error(err)
  }
  console.log(userConnected.value)
});

</script>

<style scoped>
ul {
  list-style-type: disc!important;
}
</style>