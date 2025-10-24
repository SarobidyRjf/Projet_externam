<template>
    <DashboardContent>
        <template #header>
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <h2 class="text-2xl font-bold tracking-tight">Liste des Leads</h2>
                <span class="text-slate-500">
                Assigner des leads à des utilisateurs.
                </span>
              </div>
              <div class="flex items-center gap-2 cursor-pointer" @click="refreshData()">
                <Icon name="lucide:refresh-cw" class="h-6 w-6  text-slate-500 hover:text-slate-700 transition-colors"/>
                <p class="text-slate-500">Actualiser les données</p>
              </div>
            </div>
            <p>
              Selectionner et assigner les Leads pour les attribuer à un utilisateur commercial.
            </p>
            <div class="filters grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="flex items-center gap-2 relative">
                <Input v-model="searchLead" placeholder="Rechercher..." class="" />
                <span @click="clearSearch()" class="absolute end-0 inset-y-0 flex items-center justify-center px-2 cursor-pointer">
                  <Icon name="lucide:x" class="w-4 h-4 text-gray-400" />
                </span>
              </div>
              <div class="flex items-center gap-2">
                <Select v-model="selectedChiffreAffaire" class="w-full">
                  <SelectTrigger class="">
                    <SelectValue placeholder="Choisir un chiffre d'affaire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="null">Tous</SelectItem>
                    <SelectItem v-for="(opt,i) in chiffreAffaireOptions" :key="i" :value="opt">
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <VueDatePicker
                  v-model="selectedDateRange"
                  locale="fr"
                  :enable-time-picker="false"
                  :placeholder="placeholderdate"
                  :auto-apply="false"
                  cancel-text="Retour"
                  select-text="Sélectionner"
                  range
                 />
              </div>
              <div class="grid grid-cols-1">
                <div>

                  <Popover>
                    <PopoverTrigger as-child>
                      <Button variant="outline">
                        Type de lead
                        <div class="flex gap-2">
                          <Badge
                            v-for="type in selectedCountryPhoneType"
                            :key="type"
                            variant="secondary"
                            class="flex items-center gap-1"
                          >
                            {{ type }}
                            <button
                              @click="removeType(type)"
                              class="ml-1 text-gray-500 hover:text-red-500"
                            >
                              ✕
                            </button>
                          </Badge>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="grid grid-cols-1 gap-2 w-[150px]">
                      <div class="flex items-center gap-2">
                        <Checkbox
                          id="FR"
                          :model-value="selectedCountryPhoneType.includes('Français')"
                          @update:model-value="toggleType('Français')"
                        />
                        <Label for="FR">Français</Label>
                      </div>
                      <div class="flex items-center gap-2">
                        <Checkbox
                          id="MG"
                          :model-value="selectedCountryPhoneType.includes('Malagasy')"
                          @update:model-value="toggleType('Malagasy')"
                        />
                        <Label for="MG">Malagasy</Label>
                      </div>
                    </PopoverContent>
                  </Popover>

                </div>
              </div>
            </div>
            <div class="flex flex-col justify-start gap-4 text-slate-500 text-sm md:flex-row" v-if="ability?.can('read', 'AttributionLead')">
              <Select v-model="selectedUserId" class="w-full">
                <SelectTrigger class="w-[340px]">
                  <SelectValue placeholder="Choisir un utilisateur pour attribuer des leads" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="user in user_commercial" :key="user._id" :value="user._id">
                    {{ user?.prenom }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <button
                @click="logSelectedRows()"
                v-if="ability?.can('read', 'AttributionLead')"
                class="flex items-center self-start bg-neutral-700 hover:bg-orange-500 text-white py-2 px-4 rounded w-auto dark:bg-slate-50 dark:text-stone-900"
              >
                Ajouter les Leads
              </button>
              <Loader v-if="loading" class="" />
            </div>
        </template>
        <div class="w-full space-y-4">
            <TableSkeleton v-if="loading" :rows="11" :show-header="false" />
            <DataTable ref="dataTableRef" v-else :data="leadsData" :columns="leadsColumns">
                <template #created_time-data="{ row }">
                    <span class="">{{ formatDate(row.created_time) }}</span>
                </template>
                <template #chiffre_affaire-data="{ row }">
                    <span class="">{{ formatChiffreAffaire(row.chiffre_affaire) }}</span>
                </template>

                <template #actions-data="{ row }">
                  <div class="flex items-center gap-2">
                    <!-- Bouton Voir -->
                    <Button
                      size="sm"
                      variant="outline"
                      class="h-8 w-8 p-0"
                    
                      title="Voir détails"
                    >
                      <Icon name="lucide:eye" class="h-3.5 w-3.5" />
                    </Button>
                    
                    <!-- Bouton Éditer -->
                    <Button
                      size="sm"
                      variant="outline"
                      class="h-8 w-8 p-0"
                    
                      title="Éditer"
                    >
                      <Icon name="lucide:edit" class="h-3.5 w-3.5" />
                    </Button>
                    
                    <!-- Bouton Activer/Désactiver -->
                    <Button
                      size="sm"
                      :variant="row.isActive ? 'destructive' : 'default'"
                      class="h-8 w-8 p-0"
                      
                      :title="row.isActive ? 'Désactiver' : 'Activer'"
                    >
                      <Icon 
                        :name="row.isActive ? 'lucide:user-x' : 'lucide:user-check'" 
                        class="h-3.5 w-3.5" 
                      />
                    </Button>
                    
                    <!-- Menu dropdown pour actions secondaires -->
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button
                          size="sm"
                          variant="ghost"
                          class="h-8 w-8 p-0"
                          title="Plus d'actions"
                        >
                          <Icon name="lucide:more-vertical" class="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Icon name="lucide:key" class="mr-2 h-4 w-4" />
                          Reset mot de passe
                        </DropdownMenuItem>
                        <DropdownMenuItem >
                          <Icon name="lucide:mail" class="mr-2 h-4 w-4" />
                          Envoyer email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          
                          class="text-red-600 focus:text-red-600"
                        >
                          <Icon name="lucide:trash-2" class="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            <Pagination v-if="totalPages > 1" :items-per-page="limit" :total="total" :default-page="page">
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
import { Select,SelectContent,SelectGroup,SelectItem, SelectLabel,SelectTrigger,SelectValue,} from "@/components/ui/select"
import { ref } from "vue";
import type { ColumnDefProps } from '@/components/ui/data-table/DataTable.vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { useLeadsStore } from '@/stores/leads';
import { useUserStore } from "~/stores/user";
import { storeToRefs } from "pinia";
import { useDateFormat, useFormatChiffreAffaire } from '@/composables/formatData';
import { useAuthStore } from "~/stores/auth";
import { useFacebookLeadStore } from '@/stores/facebookLead';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import debounce from 'lodash/debounce'

definePageMeta({
  middleware: "auth",
});

const dataTableRef = ref();

const { getCommercialUser } = useUserStore();
const { user_commercial } = storeToRefs(useUserStore());

const { getAllLeads, attribuateLead } = useLeadsStore(); //db
const { fetchLeadsData, fetchAccounts ,fetchFormLeads } = useFacebookLeadStore();

const { leadsData, total, loading } = storeToRefs(useLeadsStore());

const { userConnected, ability } = storeToRefs(useAuthStore());

const { formatDate } = useDateFormat();
const { formatChiffreAffaire } = useFormatChiffreAffaire();
const page = ref(1);
const limit = ref(20);
const perPageOptions = [20, 40, 50]
const selectedDateRange = ref<[Date, Date] | null >(null);
const placeholderdate = ref("--/--/----   -   --/--/----")
const selectedCountryPhoneType = ref<string[]>([])
const selectedChiffreAffaire = ref<any>(null)
const searchLead = ref('')
const debounceSearch = ref('')

const totalPages = computed(() => Math.ceil(total.value / limit.value))

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(page.value - 2, 1)
  const end = Math.min(page.value + 2, totalPages.value)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

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

const getWithFilters = () => {
  const startDate = selectedDateRange.value ? selectedDateRange.value[0].toISOString().split('T')[0] : undefined
  const endDate = selectedDateRange.value ? selectedDateRange.value[1].toISOString().split('T')[0] : undefined
  const phonePrefixes: string[] = []
  if (selectedCountryPhoneType.value.includes('Français')) phonePrefixes.push('+33')
  if (selectedCountryPhoneType.value.includes('Malagasy')) phonePrefixes.push('+261')

  const caMin = selectedChiffreAffaire.value?.min
  const caMax = selectedChiffreAffaire.value?.max
  const unite = selectedChiffreAffaire.value?.unite

  getAllLeads(page.value, limit.value, startDate, endDate, phonePrefixes, caMin, caMax, unite, debounceSearch.value)
}
const updateSearch = debounce((val: string) => {
  debounceSearch.value = val
}, 300)
const clearSearch = () => {
  searchLead.value = ''
  updateSearch('')
}

watch(searchLead, (val) => {
  page.value = 1
  updateSearch(val)
  debounce(() => {
    getWithFilters()
  }, 300)()
})
watch(selectedDateRange, () => {
  page.value = 1
  getWithFilters()
})
watch(limit, () => {
  page.value = 1
  getWithFilters()
})

watch(selectedChiffreAffaire,()=>{
  page.value = 1
  getWithFilters()
})
watch(page, () => {
  getWithFilters()
  dataTableRef.value?.table.resetRowSelection()
})

const refreshData = async () => {
  loading.value = true;
  await fetchAccounts();
  await fetchFormLeads();
  await fetchLeadsData();
  await getAllLeads();
  loading.value = false;
};

onMounted(async () => {
  await getAllLeads(1, 20);
  await getCommercialUser();
});
interface Lead {
  id: string;
  nom: string;
  ca ?: string;
  email?: string;
  phone?: string;
  commentaire?: string;
  activite?: string;
  // status: 'nouveau' | 'contacté' | 'qualifié' | 'perdu';
  createdAt: string;
}

const allColumns = ref<ColumnDefProps[]>([
  {
    id: "select",
    enableAllPageRowsSelected: true,
    enableRowSelection: true,
    showIf: (role) => role === 'super_admin',
  },
  {
    accessorKey: "full_name",
    header: "Nom",
    meta: { title: "Nom et Prénom" },
    enableSorting: true,
  },
  {
    accessorKey: "chiffre_affaire",
    header: "Ca",
    meta: { title: "Chiffre d'affaire" },
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: "Email", 
    meta: { title: "Email" },
    enableSorting: true,
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
    meta: { title: "Téléphone" },
    enableSorting: true,
  },
  {
    accessorKey: "created_time",
    header: "Activite",
    meta: { title: "Date" },
    enableSorting: true,
  },
  
]);

const leadsColumns = computed(() => {
  if(!userConnected.value) return []
  const role = userConnected?.value.role?.name || '';

  return allColumns.value.filter((col) => {
    return typeof col.showIf === 'function' ? col.showIf(role) : true;
  });
});

const selectedUserId = ref<string | null>(null); 

const logSelectedRows = async () => {
  const selected = dataTableRef.value?.table.getSelectedRowModel().rows.map((row: { original: any; }) => row.original);
  const formattedSelected = selected.map((lead: any)=> ({
    id_lead: lead._id,
    created_time: lead.created_time,
    full_name: lead.full_name,
    email: lead.email,
    phone_number: lead.phone_number,
    chiffre_affaire: lead.chiffre_affaire,
    ca_valeur_min: lead.ca_valeur_min,
    ca_valeur_max: lead.ca_valeur_max,
    unite: lead.unite,
  }));
   await attribuateLead(formattedSelected, selectedUserId.value);
   dataTableRef.value?.table.resetRowSelection();
   page.value = 1;
   await getWithFilters();
};

// Helper pour convertir le type sélectionné en préfixe téléphonique
const countryPhoneMap: Record<string, string> = {
  Français: '+33',
  Malagasy: '+261',
}
const toggleType = (type: string) => {
  if (selectedCountryPhoneType.value.includes(type)) {
    selectedCountryPhoneType.value = selectedCountryPhoneType.value.filter(t => t !== type)
  } else {
    selectedCountryPhoneType.value.push(type)
  }
  page.value = 1
  getWithFilters()
}

function removeType(type: string) {
  selectedCountryPhoneType.value = selectedCountryPhoneType.value.filter(t => t !== type);
  page.value = 1
   getWithFilters();
}

</script>

<style lang="scss" scoped>

</style>