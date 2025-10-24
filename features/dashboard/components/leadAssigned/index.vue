<template>
  <div>
    <div class="flex gap-2 mb-4">
      <select v-model="selectedPeriod" class="border rounded p-2">
        <option v-for="p in periods" :key="p.value" :value="p.value">
          {{ p.label }}
        </option>
      </select>
      <select v-if="selectedPeriod !== 'week'" v-model="selectedYear" class="border rounded p-2">
        <option v-for="y in years" :key="y" :value="y">
          {{ y }}
        </option>
      </select>
      <select v-if="selectedPeriod === 'month'" v-model="selectedMonth" class="border rounded p-2">
        <option v-for="m in months" :key="m.value" :value="m.value">
          {{ m.label }}
        </option>
      </select>
    </div>
    <client-only>
      <apexchart :options="chartOptions" :series="series" />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard';

const dashboardStore = useDashboardStore();
const { fetchLeadAssignedStats } = dashboardStore;
const { leadAssignedData } = storeToRefs(dashboardStore);

const periods = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Année' },
];

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

const weekdayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const selectedPeriod = ref('week');
const selectedYear = ref(currentYear);
const selectedMonth = ref(currentMonth);

const categories = computed(() => {
  if (selectedPeriod.value === 'week') {
    return weekdayNames;
  }
  if (selectedPeriod.value === 'month') {
    const daysInMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
  }
  return months.map((m) => m.label);
});

const series = computed(() => {
  const catLen = categories.value.length;
  const map = new Map<string, number[]>();
  for (const item of leadAssignedData.value) {
    const name = `${item.user.nom} ${item.user.prenom}`;
    if (!map.has(name)) map.set(name, Array(catLen).fill(0));
    const index = selectedPeriod.value === 'week'
      ? (item.period + 5) % 7
      : item.period - 1;
    map.get(name)![index] = item.count;
  }
  return Array.from(map.entries()).map(([name, data]) => ({ name, data }));
});

const chartOptions = computed(() => ({
  chart: {
    height: '400px',
    type: 'area',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: true,
      allowMouseWheelZoom: false,
    },
    selection: {
      enabled: false,
    },
  },
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 0,
  },
  xaxis: {
    categories: categories.value,
  },
  legend: {
    show: true,
  },
}));

watch(
  [selectedPeriod, selectedYear, selectedMonth],
  async () => {
    const params: Record<string, unknown> = { period: selectedPeriod.value };
    if (selectedPeriod.value !== 'week') {
      params.year = selectedYear.value;
    }
    if (selectedPeriod.value === 'month') {
      params.month = selectedMonth.value;
    }
    await fetchLeadAssignedStats(params);
  },
  { immediate: true }
);
</script>

