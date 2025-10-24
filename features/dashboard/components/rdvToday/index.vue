<template>
  <div>
  <Accordion type="multiple" :default-value="['today', 'week', 'month']" collapsible>
    <AccordionItem value="today">
      <AccordionTrigger class="text-lg font-bold underline">
        Rendez-vous aujourd'hui
        {{ formatDate(new Date().toDateString()) }}
      </AccordionTrigger>
      <AccordionContent>
        <ul v-if="rdvLeads.day.length">
          <li
            v-for="lead in rdvLeads.day"
            :key="lead._id"
            :class="[
              'text-sm p-2 mb-2 rounded-md cursor-pointer border-1',
              getRdvBorderClass(lead.date_rdv),
            ]"
            @click="openDetails(lead)"
            class="flex flex-col"
          >
            <span class="font-bold">{{ lead.full_name }}</span>
            <span>• {{ formatRdvDate(lead.date_rdv) }}</span>
            <span v-if="lead.type_lieu_rdv">• {{ formatRdvType(lead.type_lieu_rdv) }}</span>
            <span v-if="lead.lieu_rdv">• {{ lead.lieu_rdv }}</span>
            <span v-if="showAssigned && lead.assigned_to_user?.length">
              • Avec {{ formatAssignedUsers(lead.assigned_to_user) }}
            </span>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">Aucun rendez-vous aujourd'hui</p>
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="week">
      <AccordionTrigger class="text-lg font-bold underline">Rendez-vous cette semaine</AccordionTrigger>
      <AccordionContent>
        <ul v-if="rdvLeads.week.length">
          <li
            v-for="lead in rdvLeads.week"
            :key="lead._id"
            :class="[
              'text-sm p-2 mb-2 rounded-md cursor-pointer border-1',
              getRdvBorderClass(lead.date_rdv),
            ]"
            @click="openDetails(lead)"
            class="flex flex-col"
          >
            <span class="font-bold">{{ lead.full_name }}</span>
            <span>• {{ formatRdvDate(lead.date_rdv, true) }}</span>
            <span v-if="lead.type_lieu_rdv">• {{ formatRdvType(lead.type_lieu_rdv) }}</span>
            <span v-if="lead.lieu_rdv">• {{ lead.lieu_rdv }}</span>
            <span
              v-if="isRdvPast(lead.date_rdv)"
              class="text-xs italic text-muted-foreground"
            >
              RDV passé
            </span>
            <span v-if="showAssigned && lead.assigned_to_user?.length">
              • Avec {{ formatAssignedUsers(lead.assigned_to_user) }}
            </span>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">Aucun rendez-vous cette semaine</p>
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="month">
      <AccordionTrigger class="text-lg font-bold underline">Rendez-vous ce mois-ci</AccordionTrigger>
      <AccordionContent>
        <ul v-if="rdvLeads.month.length">
          <li
            v-for="lead in rdvLeads.month"
            :key="lead._id"
            :class="[
              'text-sm p-2 mb-2 rounded-md cursor-pointer border-1',
              getRdvBorderClass(lead.date_rdv),
            ]"
            @click="openDetails(lead)"
            class="flex flex-col"
          >
            <span class="font-bold">{{ lead.full_name }}</span>
            <span>• {{ formatRdvDate(lead.date_rdv, true) }}</span>
            <span v-if="lead.type_lieu_rdv">• {{ formatRdvType(lead.type_lieu_rdv) }}</span>
            <span v-if="lead.lieu_rdv">• {{ lead.lieu_rdv }}</span> 
            <span
              v-if="isRdvPast(lead.date_rdv)"
              class="text-xs italic text-muted-foreground"
            >
              RDV passé
            </span>
            <span v-if="showAssigned && lead.assigned_to_user?.length">
              • Avec {{ formatAssignedUsers(lead.assigned_to_user) }}
            </span>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">Aucun rendez-vous ce mois-ci</p>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
  <LeadDetailsDrawer
    v-model:open="showDrawer"
    :lead="selectedLead"
  />
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '~/stores/dashboard';
import { useAuthStore } from '~/stores/auth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useFormatDateTime } from '@/composables/formatData';
import { useDateFormat } from '@/composables/formatData';
import LeadDetailsDrawer from './LeadDetailsDrawer.vue';
import type { RdvTodayLead } from '~/stores/dashboard';
import { RDV_TYPE_LABELS } from '~/constants/rdvTypes';

const { fetchTodayRdvLeads } = useDashboardStore();
const auth = useAuthStore();
const { userConnected } = storeToRefs(auth);
const showAssigned = computed(() => {
  const role = userConnected.value?.role?.name;
  return role === 'super_admin' || role === 'responsable_commercial';
});

const rdvLeads = reactive<{ day: RdvTodayLead[]; week: RdvTodayLead[]; month: RdvTodayLead[] }>({
  day: [],
  week: [],
  month: [],
});
const { formatDateTime } = useFormatDateTime();
const { formatDate } = useDateFormat();
const showDrawer = ref(false);
const selectedLead = ref<RdvTodayLead | null>(null);

const formatRdvType = (type?: string | null) => {
  if (!type) return '';
  return RDV_TYPE_LABELS[type] ?? type;
};

const formatAssignedUsers = (users?: RdvTodayLead['assigned_to_user']) => {
  if (!Array.isArray(users) || users.length === 0) {
    return '';
  }

  return users
    .map((user) => {
      const fullName = [user?.prenom, user?.nom].filter(Boolean).join(' ').trim();
      return fullName || user?._id || 'Monteur';
    })
    .filter(Boolean)
    .join(', ');
};

const openDetails = (lead: RdvTodayLead) => {
  selectedLead.value = lead;
  showDrawer.value = true;
};

const formatRdvDate = (date: string, showDate = false) => {
  const formatted = formatDateTime(date);
  if (!showDate) {
    const parts = formatted.split(' ');
    return parts[parts.length - 1];
  }
  return formatted;
};

const isRdvPast = (date: string) => {
  const now = new Date();
  const rdvDate = new Date(date);
  return rdvDate.getTime() < now.getTime();
};

const getRdvBorderClass = (date: string) => {
  const now = new Date();
  const rdvDate = new Date(date);

  if (rdvDate.getTime() < now.getTime()) {
    return 'border-red-500 border-dashed border-1 bg-muted';
  }

  const diffInHours = (rdvDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (diffInHours <= 12) {
    return 'border-orange-300 bg-orange-50 text-gray-800';
  }

  return 'border-green-400 bg-green-50 text-gray-800  border-green-100';
};

onMounted(async () => {
  rdvLeads.day = (await fetchTodayRdvLeads('day')) ?? [];
  rdvLeads.week = (await fetchTodayRdvLeads('week')) ?? [];
  rdvLeads.month = (await fetchTodayRdvLeads('month')) ?? [];
});
</script>

<style scoped>
ul{
  margin-left: 1rem
}
</style>

