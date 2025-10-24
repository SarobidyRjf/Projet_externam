<template>
  <div>
    <client-only>
      <apexchart
        width=""
        type="bar"
        :options="chartOptions"
        :series="series"
      />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard';

const { fetchLeadProcessStats } = useDashboardStore();
const { leadProcessData } = storeToRefs(useDashboardStore());

const series = computed(() => [
  {
    name: 'Leads',
    data: leadProcessData.value.map((s) => s.count)
  }
]);

const chartOptions = computed(() => ({
  chart: {
    id: 'lead-process-chart',
    height: '400px'
  },
  plotOptions: { bar: { distributed: true } },
  xaxis: {
    categories: leadProcessData.value.map((s) => s._id)
  },
  colors: ['#3498DB', '#E74C3C'],
  legend: { show: true }
}));

onMounted(async () => {
  await fetchLeadProcessStats();
});
</script>
