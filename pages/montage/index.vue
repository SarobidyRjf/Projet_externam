<template>
  <DashboardContent>
    <template #header>
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-bold tracking-tight">Mes leads montage</h2>
        <p class="text-sm text-muted-foreground">
          Visualisez et mettez à jour les leads qui vous sont assignés pour le montage.
        </p>
      </div>
    </template>

    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative w-full sm:max-w-xs">
          <Input
            v-model="searchTerm"
            type="text"
            placeholder="Rechercher un lead..."
            class="pr-8"
          />
          <button
            v-if="searchTerm"
            type="button"
            class="absolute inset-y-0 right-2 flex items-center text-muted-foreground transition hover:text-foreground"
            @click="clearSearch"
          >
            <Icon name="lucide:x" class="h-4 w-4" />
          </button>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">Lignes par page</span>
          <select
            v-model.number="limit"
            class="rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option v-for="option in perPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
      </div>

      <TableSkeleton v-if="loading && !leads.length" :rows="6" :show-header="false" />

      <DataTable
        v-else
        :data="leads"
        :columns="columns"
        @row-click="openLeadDialog"
      >
        <template #status-data="{ row }">
          <Badge
            variant="outline"
            class="flex items-center gap-2"
            :class="getStatusBadgeClasses(row.status)"
          >
            <Icon
              v-if="row.status === 'RDV'"
              name="lucide:calendar-check"
              class="h-4 w-4"
            />
            <Icon
              v-else-if="row.status === 'Nouveau lead'"
              name="lucide:loader"
              class="h-4 w-4"
            />
            <Icon
              v-else-if="row.status === 'Paiement'"
              name="lucide:credit-card"
              class="h-4 w-4"
            />
            <Icon
              v-else-if="row.status === 'Devis'"
              name="lucide:file-text"
              class="h-4 w-4"
            />
            <Icon
              v-else-if="row.status === 'Closing'"
              name="lucide:panel-right-close"
              class="h-4 w-4"
            />
            <Icon
              v-else-if="row.status === 'RDV stratégique'"
              name="lucide:calendar-check"
              class="h-4 w-4"
            />
            <Icon
              v-else-if="row.status === 'marketing'"
              name="lucide:chart-column"
              class="h-4 w-4"
            />
            <Icon
              v-else-if="row.status === 'montage'"
              name="lucide:square-play"
              class="h-4 w-4"
            />
            <Icon
              v-else-if="row.status === 'Hors cible'"
              name="lucide:square-x"
              class="h-4 w-4"
            />
            <Icon
              v-else-if="row.status === 'Facture'"
              name="lucide:file-text"
              class="h-4 w-4"
            />
            {{ row.status || 'Non défini' }}
          </Badge>
        </template>

        <template #date_rdv-data="{ row }">
          <span>{{ row.date_rdv ? formatDate(row.date_rdv) : '—' }}</span>
        </template>
      </DataTable>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-muted-foreground">
          Page {{ page }} sur {{ totalPages }} — {{ total }} lead{{ total > 1 ? 's' : '' }}
        </p>
        <Pagination
          v-if="totalPages > 1"
          :items-per-page="limit"
          :total="total"
          :default-page="page"
        >
          <PaginationPrevious @click="page = Math.max(page - 1, 1)">
            <Icon name="lucide:chevron-left" class="h-4 w-4" />
            Précédent
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

          <PaginationEllipsis
            v-if="visiblePages[visiblePages.length - 1] < totalPages"
            :index="visiblePages.length + 1"
          />

          <PaginationNext @click="page = Math.min(page + 1, totalPages)">
            Suivant
            <Icon name="lucide:chevron-right" class="h-4 w-4" />
          </PaginationNext>
        </Pagination>
      </div>
    </div>

    <MontageLeadDialog
      v-model:open="dialogOpen"
      :lead="selectedLead"
      @saved="handleLeadSaved"
    />
  </DashboardContent>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import debounce from 'lodash/debounce';
import type { ColumnDefProps } from '@/components/ui/data-table/DataTable.vue';
import { useDateFormat } from '@/composables/formatData';
import { useMontageStore } from '~/stores/montage';
import MontageLeadDialog from '@/features/montage/components/MontageLeadDialog.vue';
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

definePageMeta({
  middleware: 'auth',
});

const montageStore = useMontageStore();
const { leads, total, loading } = storeToRefs(montageStore);
const { fetchAssignedLeads } = montageStore;

const page = ref(1);
const limit = ref(20);
const perPageOptions = [10, 20, 50];
const searchTerm = ref('');
const debouncedSearch = ref('');

const { formatDate } = useDateFormat();

const columns: ColumnDefProps[] = [
  { accessorKey: 'full_name', header: 'Nom', meta: { title: 'Nom et prénom' }, enableSorting: true },
  { accessorKey: 'email', header: 'Email', meta: { title: 'Email' }, enableSorting: true },
  { accessorKey: 'phone_number', header: 'Téléphone', meta: { title: 'Téléphone' } },
  { accessorKey: 'status', header: 'Statut', meta: { title: 'Statut' }, enableSorting: true },
  { accessorKey: 'date_rdv', header: 'Date RDV', meta: { title: 'Date de rendez-vous' }, enableSorting: true },
];

const getStatusBadgeClasses = (status?: string) => ({
  'bg-cyan-50 text-cyan-500 border-cyan-100': status === 'RDV',
  'bg-yellow-50 text-yellow-500 border-yellow-100': status === 'Nouveau lead',
  'bg-green-50 text-green-500 border-green-100': status === 'Paiement',
  'bg-purple-50 text-purple-500 border-purple-100': status === 'Devis',
  'bg-orange-50 text-orange-500 border-orange-100': status === 'Closing',
  'bg-pink-50 text-pink-500 border-pink-100': status === 'RDV stratégique',
  'bg-indigo-50 text-indigo-500 border-indigo-100': status === 'marketing',
  'bg-gray-50 text-gray-500 border-gray-100': status === 'montage',
  'bg-red-50 text-red-500 border-red-100': status === 'Hors cible',
  'bg-blue-50 text-blue-500 border-blue-100': status === 'Facture',
});

const updateSearch = debounce((value: string) => {
  debouncedSearch.value = value;
}, 300);

watch(searchTerm, (value) => {
  updateSearch(value);
  if (!value) {
    debouncedSearch.value = '';
  }
  page.value = 1;
});

const loadLeads = async () => {
  try {
    await fetchAssignedLeads({
      page: page.value,
      limit: limit.value,
      search: debouncedSearch.value,
    });
  } catch (error) {
    console.error(error);
  }
};

watch(
  [page, limit, debouncedSearch],
  () => {
    loadLeads();
  },
  { immediate: true }
);

const totalPages = computed(() => Math.max(Math.ceil(total.value / limit.value), 1));

const visiblePages = computed(() => {
  const pages: number[] = [];
  const start = Math.max(page.value - 2, 1);
  const end = Math.min(page.value + 2, totalPages.value);

  for (let current = start; current <= end; current += 1) {
    pages.push(current);
  }

  return pages;
});

const dialogOpen = ref(false);
const selectedLead = ref<Record<string, any> | null>(null);

const openLeadDialog = (lead: Record<string, any>) => {
  selectedLead.value = lead;
  dialogOpen.value = true;
};

const clearSearch = () => {
  searchTerm.value = '';
  debouncedSearch.value = '';
};

const handleLeadSaved = async (leadId: string) => {
  await loadLeads();
  const updatedLead = leads.value.find((lead) => lead._id === leadId) ?? null;
  selectedLead.value = updatedLead;
};

watch(dialogOpen, (isOpen) => {
  if (!isOpen) {
    selectedLead.value = null;
  }
});
</script>
