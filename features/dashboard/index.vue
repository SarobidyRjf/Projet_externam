<script setup lang="ts">
import statusLead from './components/statusLead/index.vue'
import transactionsChart from './components/transactions/index.vue'
import leadProcess from './components/leadProcess/index.vue'
import rdvToday from './components/rdvToday/index.vue'
import leadAssigned from './components/leadAssigned/index.vue'
import { useDashboardStore } from '~/stores/dashboard'

const dashboardStore = useDashboardStore()
const { transactionsData, statusData } = storeToRefs(dashboardStore)
const { fetchTransactionStats, fetchStatusStats } = dashboardStore

const totalDevis = computed(() =>
  transactionsData.value
    .filter((item) => item._id.type === 'Devis')
    .reduce((sum, item) => sum + item.count, 0)
)

const totalFactures = computed(() =>
  statusData.value.find((item) => item._id === 'Facture')?.count ?? 0
)

onMounted(async () => {
  const requests: Promise<unknown>[] = []

  if (!transactionsData.value.length) {
    requests.push(fetchTransactionStats({ year: new Date().getFullYear() }))
  }

  if (!statusData.value.length) {
    requests.push(fetchStatusStats())
  }

  await Promise.all(requests)
})
</script>

<template>
  <DashboardContent>
    <template #header>
      <h2 class="text-2xl font-bold tracking-tight">Dashboard</h2>
    </template>

    <Tabs default-value="newInfo" class="space-y-4">
      <TabsList>
        <TabsTrigger value="newInfo">Rendez-vous</TabsTrigger>
        <TabsTrigger value="overview"> Vue globales </TabsTrigger>
        <TabsTrigger value="reports" disabled> Rapport </TabsTrigger>
        <TabsTrigger value="notifications" disabled>
          Notifications
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader
              class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <CardTitle class="text-sm font-medium"> Nombre de status per leads </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                class="h-4 w-4 text-muted-foreground"
              >
                <path
                  d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <statusLead />
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <CardTitle class="text-sm font-medium"> Leads à traiter </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="h-4 w-4 text-muted-foreground"
              >
                <path d="M3 3v18h18" />
                <path d="M8 8h8M8 12h8M8 16h8" />
              </svg>
            </CardHeader>
            <CardContent>
              <leadProcess />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader
              class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <CardTitle class="text-sm font-medium"> Devis & Paiement par date </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                class="h-4 w-4 text-muted-foreground"
              >
                <path d="M3 3v18h18" />
                <path d="M18 9l-6 6-3-3" />
              </svg>
            </CardHeader>
            <CardContent>
              <transactionsChart />
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <CardTitle class="text-sm font-medium"> Leads attribués par utilisateur </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                class="h-4 w-4 text-muted-foreground"
              >
                <path d="M3 3v18h18" />
                <path d="M8 13l4 4 8-8" />
              </svg>
            </CardHeader>
            <CardContent>
              <leadAssigned />
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <CardTitle class="text-sm font-medium"> Nombre de devis </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                class="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ totalDevis }}</div>
              <p class="text-xs text-muted-foreground">
                Total des devis enregistrés
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <CardTitle class="text-sm font-medium">Nombre des Ventes </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                class="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ totalFactures }}</div>
              <p class="text-xs text-muted-foreground">
                Vente encaissée
              </p>
            </CardContent>
          </Card>
          <!-- <Card>
            <CardHeader
              class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <CardTitle class="text-sm font-medium"> Facture </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                class="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">17</div>
              <p class="text-xs text-muted-foreground">+2 depuis la dernière heure</p>
            </CardContent>
          </Card> -->
        </div>
      </TabsContent>

      <TabsContent value="newInfo">
        <rdvToday />
      </TabsContent>
    </Tabs>
  </DashboardContent>
</template>
