<template>
  <DetailsDrawer
    direction="right"
    v-model:open="open"
    :title="'Détails du Lead'"
    :description="'Informations complètes'"
  >
    <div class="space-y-2">
      <h1 class="text-center font-bold">
        <Badge variant="outline" class="bg-orange-50 text-orange-400 border-orange-100">
          Informations du Lead
        </Badge>
      </h1>
      <div class="grid grid-cols-1 md:grid-cols-2 space-y-3">
        <p v-if="!lead?.nom && !lead?.prenom">
          <strong>Nom et Prénom :</strong>
          {{ lead?.full_name }}
        </p>
        <p v-if="lead?.nom">
          <strong>Nom :</strong> {{ lead?.nom }}
        </p>
        <p v-if="lead?.prenom">
          <strong>Prénom :</strong> {{ lead?.prenom }}
        </p>
        <p><strong>Email :</strong> {{ lead?.email }}</p>
        <p><strong>Téléphone :</strong> {{ lead?.phone_number }}</p>
        <p><strong>Status :</strong> {{ lead?.status }}</p>
        <p>
          <strong>Objectif du client :</strong>
          {{ lead?.objectif_client }}
        </p>
      </div>
    </div>
    <hr />
    <div class="space-y-2">
      <h1 class="text-center font-bold text-orange-400">
        <Badge variant="outline" class="bg-orange-50 text-orange-400 border-orange-100">
          Informations de la société
        </Badge>
      </h1>
      <div class="grid grid-cols-1 md:grid-cols-2 space-y-3">
        <p>
          <strong>Nom de la societe :</strong>
          {{ lead?.nom_societe }}
        </p>
        <p>
          <strong>Adresse de la societe :</strong>
          {{ lead?.localisation_societe }}
        </p>
        <p>
          <strong>Activité de la societe :</strong>
          {{ lead?.fonction }}
        </p>
        <p><strong>Panier :</strong> {{ lead?.panier }}</p>
        <p><strong>Domaine :</strong> {{ lead?.domaine }}</p>
        <p>
          <strong>Chiffre d'affaire :</strong>
          {{ lead?.chiffre_affaire }}
        </p>
        <p><strong>Lieu de vente :</strong> {{ lead?.lieu_vente }}</p>
        <p>
          <strong>Date de création :</strong>
          {{
            lead?.date_creation
              ? formatDate(lead.date_creation)
              : ''
          }}
        </p>
        <p><strong>Resultat net :</strong> {{ lead?.resultat_net }}</p>
        <p><strong>Produit vendu :</strong> {{ lead?.produit_vendu }}</p>
        <p>
          <strong>Taille de l'entreprise :</strong>
          {{ lead?.taille_entreprise }}
        </p>
        <p>
          <strong>Tarif prestation :</strong>
          {{ lead?.tarif_prestation }}
        </p>
      </div>
    </div>
    <hr />
    <div class="space-y-2">
      <h1 class="text-center font-bold text-orange-400">
        <Badge variant="outline" class="bg-orange-50 text-orange-400 border-orange-100">
          Informations marketing
        </Badge>
      </h1>
      <p>
        <strong>Canaux marketing :</strong>
        {{ lead?.canaux_marketing }}
      </p>
      <div class="flex flex-wrap flex-row gap-4">
        <div v-if="lead?.lien_insta" class="flex flex-row items-center">
          <Icon name="lucide:instagram" class="w-4 h-4 mr-1" />
          <a
            class="hover:underline hover:text-blue-400"
            :href="
              lead?.lien_insta?.startsWith('http')
                ? lead.lien_insta
                : `https://${lead?.lien_insta}`
            "
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ lead?.lien_insta }}
          </a>
        </div>
        <div v-if="lead?.lien_fb" class="flex flex-row items-center">
          <Icon name="lucide:facebook" class="w-4 h-4 mr-1" />
          <a
            class="hover:underline hover:text-blue-400"
            :href="
              lead?.lien_fb?.startsWith('http')
                ? lead.lien_fb
                : `https://${lead?.lien_fb}`
            "
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ lead?.lien_fb }}
          </a>
        </div>
        <div v-if="lead?.lien_tiktok" class="flex flex-row items-center">
          <Icon name="hugeicons:tiktok" class="w-4 h-4 mr-1" />
          <a
            class="hover:underline hover:text-blue-400"
            :href="
              lead?.lien_tiktok?.startsWith('http')
                ? lead.lien_tiktok
                : `https://${lead?.lien_tiktok}`
            "
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ lead?.lien_tiktok }}
          </a>
        </div>
        <div v-if="lead?.lien_linkedin" class="flex flex-row items-center">
          <Icon name="lucide:linkedin" class="w-4 h-4 mr-1" />
          <a
            class="hover:underline hover:text-blue-400"
            :href="
              lead?.lien_linkedin?.startsWith('http')
                ? lead.lien_linkedin
                : `https://${lead?.lien_linkedin}`
            "
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ lead?.lien_linkedin }}
          </a>
        </div>
        <div v-if="lead?.lien_siteweb" class="flex flex-row items-center">
          <Icon name="lucide:globe" class="w-4 h-4 mr-1" />
          <a
            class="hover:underline hover:text-blue-400"
            :href="
              lead?.lien_siteweb?.startsWith('http')
                ? lead.lien_siteweb
                : `https://${lead?.lien_siteweb}`
            "
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ lead?.lien_siteweb }}
          </a>
        </div>
      </div>
    </div>
    <hr />
    <div class="space-y-2">
      <h1 class="text-center font-bold text-orange-400">
        <Badge variant="outline" class="bg-orange-50 text-orange-400 border-orange-100">
          Informations du Rendez-vous
        </Badge>
      </h1>
      <p>
        <strong>Date et heure du rendez-vous :</strong>
        {{
          lead?.date_rdv
            ? formatDateTime(lead.date_rdv)
            : ''
        }}
      </p>
      <p>
        <strong>Type de rendez-vous :</strong>
        {{ formatRdvType(lead?.type_lieu_rdv) }}
      </p>
      <p>
        <strong>Lieu du rendez-vous :</strong>
        {{ lead?.lieu_rdv }}
      </p>
    </div>
    <hr />
    <div class="space-y-2">
      <h1 class="text-center font-bold text-orange-400">
        <Badge variant="outline" class="bg-orange-50 text-orange-400 border-orange-100">
          Autres
        </Badge>
      </h1>
      <p>
        <strong>Commentaire :</strong>
        {{ lead?.commentaire }}
      </p>
      <div v-if="lead?.note_R1" class="flex flex-row gap-2">
        <strong>Note R1 :</strong>
        <div v-html="lead?.note_R1"></div>
      </div>
      <div v-if="lead?.note_R2" class="flex flex-row gap-2">
        <strong>Note R2 :</strong>
        <span v-html="lead?.note_R2"></span>
      </div>
      <div v-if="lead?.note_R3" class="flex flex-row gap-2">
        <strong>Note R3 :</strong>
        <span v-html="lead?.note_R3"></span>
      </div>
      <div v-if="lead?.note_RDV_strategique" class="flex flex-row gap-2">
        <strong>Note RDV stratégique :</strong>
        <span v-html="lead?.note_RDV_strategique"></span>
      </div>
      <div v-if="lead?.note_paiements" class="flex flex-row gap-2">
        <strong>Note paiement :</strong>
        <span v-html="lead?.note_paiements"></span>
      </div>
    </div>
  </DetailsDrawer>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { useFormatDateTime, useDateFormat } from '@/composables/formatData';
import DetailsDrawer from '@/features/leads/components/DetailsLeads.vue';
import type { RdvTodayLead } from '~/stores/dashboard';
import { RDV_TYPE_LABELS } from '~/constants/rdvTypes';

const props = defineProps<{
  open: boolean;
  lead: RdvTodayLead | null;
}>();

const emit = defineEmits(['update:open']);
const { lead } = toRefs(props);

const open = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
});

const { formatDateTime } = useFormatDateTime();
const { formatDate } = useDateFormat();

const formatRdvType = (type?: string | null) => {
  if (!type) return '';
  return RDV_TYPE_LABELS[type] ?? type;
};
</script>

