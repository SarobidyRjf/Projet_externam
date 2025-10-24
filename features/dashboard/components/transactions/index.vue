<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <div class="flex gap-2 mb-4">
      <select v-model="selectedYear" class="border rounded p-2">
        <option v-for="y in years" :key="y" :value="y">
          {{ y }}
        </option>
      </select>
    </div>
    <client-only>
      <apexchart
        width=""
        :options="chartOptions"
        :series="series"
      />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard';

const dashboardStore = useDashboardStore();
const { fetchTransactionStats } = dashboardStore;
const { transactionsData } = storeToRefs(dashboardStore);

const months = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const selectedYear = ref(currentYear);

const typeColors: Record<string, string> = {
  Devis: '#d900d2',
  Paiement: '#00d69a',
};

const categories = months.map((m) => m.label);

const series = computed(() => {
  return Object.keys(typeColors).map((type) => ({
    name: type,
    data: months.map((m) => {
      const item = transactionsData.value.find(
        (s) => s._id.month === m.value && s._id.type === type
      );
      return item ? item.count : 0;
    }),
  }));
});

const chartOptions = computed(() => ({
  chart: {
    height: '400px',
    type: 'area',
    zoom: {
      enabled: true,
      allowMouseWheelZoom: false,
    },
    toolbar: {
      show: false
    },
    selection: {
      enabled: false,
    },
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  dataLabels: {
    enabled: false
  }, 
  markers: {
    size: 0
  },
  xaxis: {
    categories,
  },
  colors: Object.values(typeColors),
  legend: {
    show: true,
  },
}));

watch(
  selectedYear,
  async () => {
    await fetchTransactionStats({ year: selectedYear.value });
  },
  { immediate: true }
);
</script>
