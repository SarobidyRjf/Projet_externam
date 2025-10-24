<template>
  <div>
    <client-only>
        <apexchart 
            width=""
            type="bar" 
            :options="chartOptions" 
            :series="series">
        </apexchart>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard';

const { fetchStatusStats } = useDashboardStore();
const { statusData } = storeToRefs(useDashboardStore());

const statusColors: Record<string, string> = {
  "Nouveau lead": "#1E90FF",
  "Hors cible": "#FF6347",
  "Paiement": "#2ECC71",
  "RDV stratégique": "#9B59B6",
  "RDV": "#F1C40F",
  "Facture": "#E67E22",
  "Devis": "#D900D2",
};

const statusOrder = [
  "Nouveau lead",
  "RDV",
  "Devis",
  "Facture",
  "Paiement",
  "RDV stratégique",
  "Hors cible",
];

const orderedStatusData = computed(() => {
  const map = new Map(statusData.value?.map((s) => [s._id, s.count]));
  return statusOrder.map((key) => ({ _id: key, count: map.get(key) ?? 0 }));
});

const series = computed(() => {
    return [
      {
        name: "Leads",
        data: orderedStatusData.value.map((s) => s.count),
      },
  ];
});

const chartOptions = computed(() => ({
  chart: {
        id: "leads-chart",
        height: '400px'
    },
  plotOptions: { bar: { distributed: true } },
  xaxis: {
    categories: orderedStatusData.value.map((s) => s._id),
  },
    colors: orderedStatusData.value.map((s) => statusColors[s._id]),
    legend: {
        show: true
    }
}));


onMounted(async() => {
    await fetchStatusStats();
})
</script>
