<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-scroll h-[460px] mt-4">
    <!-- Column #1 -->
    <div class="grid gap-4 h-fit">
      <div>
        <Card>
          <CardHeader>
            <CardTitle class="text-center">
              <Badge variant="outline" class="bg-cyan-50 text-cyan-600 border-cyan-100">Informations clients</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="full_name">Nom* :</Label>
              <Input :class="{'border-red-500': v$.nom.$error}" v-model="dataToSend.nom" id="full_name" type="text" placeholder="" />
            </div>
            <div class="space-y-2">
              <Label for="full_name">Prénom* :</Label>
              <Input :class="{'border-red-500': v$.prenom.$error}" v-model="dataToSend.prenom" id="full_name" type="text" placeholder="" />
            </div>
            <div class="space-y-2">
              <Label for="full_name">Téléphone* test:</Label>
              <vue-tel-input
                v-model="dataToSend.phone_number"
                mode="international"
                :onlyCountries="['FR', 'MG']"
                defaultCountry="MG"
                placeholder="Entrer le numéro"
                inputOptions="{ showDialCode: true }"
                :class="{'border-red-500': v$.phone.$error}"
              />
            </div>
            <div class="space-y-2">
              <Label for="full_name">Email* :</Label>
              <Input :class="{'border-red-500': v$.email.$error}" v-model="dataToSend.email" id="full_name" type="text" placeholder="" />
            </div>
            <div class="space-y-2">
              <Label for="phone_number">Objecifs du client* :</Label>
              <Input :class="{'border-red-500': v$.objectif_client.$error}" v-model="dataToSend.objectif_client" id="phone_number" type="text" placeholder="" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle class="text-center text-slate-500">
            <Badge variant="outline" class="bg-purple-50 text-purple-600 border-purple-100">Marketing</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <Label for="phone_number">Canaux marketing acquisition client* :</Label>
            <Input :class="{'border-red-500': v$.canaux_marketing.$error}" v-model="dataToSend.canaux_marketing" id="phone_number" type="text" placeholder="" />
          </div>
          <div class="space-y-2 mt-4">
            <Label>Liens cannaux marketing* :</Label>
            <span class="text-red-500 text-[12px]" v-if="v$.lien_fb.$error">Veuillez renseigner au moins un lien</span>
            <div class="grid grid-cols-1 md:grid-cols-1 gap-2">
              <div class="flex items-center space-x-2">
                <Label class="text-[12px] w-[15%]">Facebook</Label>
                <Input type="text" v-model="dataToSend.lien_fb" placeholder="https://www.facebook.com/" />
              </div>
              <div class="flex items-center space-x-2">
                <Label class="text-[12px] w-[15%]">Instagram</Label>
                <Input type="text" v-model="dataToSend.lien_insta" placeholder="https://www.facebook.com/" />
              </div>
              <div class="flex items-center space-x-2">
                <Label class="w-[15%]">Tiktok</Label>
                <Input type="text" v-model="dataToSend.tiktok" placeholder="https://www.facebook.com/" />
              </div>
              <div class="flex items-center space-x-2">
                <Label class="text-[12px] w-[15%]">Linkedin</Label>
                <Input type="text" v-model="dataToSend.lien_linkedin" placeholder="https://www.facebook.com/" />
              </div>
              <div class="flex items-center space-x-2">
                <Label class="text-[12px] w-[15%]">Siteweb</Label>
                <Input type="text" v-model="dataToSend.lien_siteweb" placeholder="https://www.facebook.com/" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div class="mt-4 space-y-6">
        <Card class="flex flex-col">
          <CardHeader class="pb-2">
            <CardTitle class="text-base font-semibold">Statuts du lead</CardTitle>
            <CardDescription>Activez un statut puis définissez sa date d'application.</CardDescription>
          </CardHeader>
          <CardContent class="grow space-y-3">
            <div
              v-for="status in statusOptions"
              :key="status.value"
              class="rounded-xl"
            >
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6" :class="{ 'md:items-start': status.value === 'RDV'}">
                <div class="flex items-center gap-2">
                  <Checkbox
                    :id="`status-${status.value}`"
                    :model-value="Boolean(statusSelections?.[status.value])"
                    @update:model-value="(val) => emitToggleStatus(status.value, !!val)"
                  />
                  <Label :for="`status-${status.value}`" class="font-medium text-slate-700">{{ status.label }}</Label>
                </div>
                <div class="w-full md:w-1/2">
                  <template v-if="status.value === 'RDV' && statusSelections?.[status.value]">
                    <div class="flex flex-col gap-2">
                      <div
                        v-for="(occurrence, index) in rdvOccurrences"
                        :key="`rdv-occurrence-${index}`"
                        class="flex flex-row items-center gap-2"
                      >
                        <div
                          class="text-xs w-[80px] font-semibold text-slate-500"
                          :class="!statusSelections?.[status.value] ? 'opacity-60' : 'opacity-100'"
                        >
                          {{ getRdvOccurrenceLabel(index) }}
                        </div>
                        <VueDatePicker
                          :model-value="occurrence ?? null"
                          @update:model-value="(val: StatusDateInput) => onRdvOccurrenceInput(index, val)"
                          :enable-time-picker="true"
                          locale="fr-FR"
                          :disabled-week-days="[]"
                          format="dd/MM/yyyy, HH:mm"
                          cancel-text="Retour"
                          select-text="Sélectionner"
                          placeholder="--/--/---- à --:--"
                          clearable
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        class="self-end text-muted-foreground"
                        @click="emitAddRdvOccurrence"
                      >
                        Ajouter un RDV
                      </Button>
                    </div>
                  </template>
                  <template v-else>
                    <div class="w-full flex flex-row items-center space-y-1 gap-2">
                      <div
                        class="text-xs w-[80px] font-semibold text-slate-500"
                        :class="!statusSelections?.[status.value] ? 'opacity-60' : 'opacity-100'"
                      >
                        {{ getStatusDateLabel(status.value) }}
                      </div>
                      <VueDatePicker
                        :model-value="statusDates?.[status.value] ?? null"
                        @update:model-value="(val: StatusDateInput) => onStatusDateInput(status.value, val)"
                        :enable-time-picker="true"
                        locale="fr-FR"
                        :disabled-week-days="[]"
                        format="dd/MM/yyyy, HH:mm"
                        cancel-text="Retour"
                        select-text="Sélectionner"
                        placeholder="--/--/---- à --:--"
                        :disabled="!statusSelections?.[status.value]"

                      />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <!-- Column #2 -->
    <div class="grid gap-4 h-fit">
      <div>
        <Card>
          <CardHeader>
            <CardTitle class="text-center text-slate-500">
              <Badge variant="outline" class="bg-green-50 text-green-500 border-green-100">Rendez-vous planifié</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="phone_number">Date du prochain rendez-vous* :</Label>
              <VueDatePicker
                :class="{'error-input': v$.date_rdv.$error}"
                v-model="dataToSend.date_rdv"
                :enable-time-picker="true"
                locale="fr-FR"
                :disabled-week-days="[6, 0]"
                format="dd/MM/yyyy, HH:mm"
                cancel-text="Retour"
                select-text="Sélectionner"
                :min-date="new Date()"
                placeholder="--/--/---- à --:--"
              />
            </div>
            <div class="space-y-2">
              <Label for="type_rdv">Type de rendez-vous* :</Label>
              <Select v-model="dataToSend.type_lieu_rdv">
                <SelectTrigger class="w-full" :class="{'border-red-500': v$.type_lieu_rdv.$error}">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem v-for="option in rdvTypeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="phone_number">Lieu du prochain rendez-vous :</Label>
              <Input :class="{'border-red-500': v$.lieu_rdv.$error}" v-model="dataToSend.lieu_rdv" id="phone_number" type="text" placeholder="" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle class="text-center text-slate-500">
              <Badge variant="outline" class="bg-orange-50 text-orange-500 border-orange-100">Informations de la société</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="email">Nom de la société* :</Label>
              <Input :class="{'border-red-500': v$.nom_societe.$error}" v-model="dataToSend.nom_societe" id="email" type="email" placeholder="" />
            </div>
            <div class="space-y-2 relative">
              <Label>Localisation de la boite* :</Label>
              <div class="relative">
                <Input
                  :class="{
                    'border-red-500': v$.localisation_societe.$error,
                    'pr-10': isFetchingAddress,
                  }"
                  v-model="dataToSend.localisation_societe"
                  type="text"
                  placeholder=""
                />
                <Loader2
                  v-if="isFetchingAddress"
                  class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 animate-spin"
                />
              </div>
              <ul
                v-if="addressResults.length"
                class="shadow-lg p-4 bg-dark rounded-lg absolute z-10 bg-white border rounded-md mt-1 w-full max-h-50 overflow-y-auto"
              >
                <li
                  v-for="item in addressResults"
                  :key="item.properties.id"
                  class="px-2 py-1 cursor-pointer hover:bg-gray-100"
                  @click="selectAddress(item)"
                >
                  {{ item.properties.label }}
                </li>
              </ul>
            </div>
            <div class="space-y-2">
              <Label>Chiffre d'affaires* :</Label>
              <Input :class="{'border-red-500': v$.chiffre_affaire.$error}" v-model="dataToSend.chiffre_affaire" type="text" placeholder="" />
            </div>
            <div class="space-y-2">
              <Label>Panier moyen :</Label>
              <Input :class="{'border-red-500': v$.panier.$error}" v-model="dataToSend.panier" type="text" placeholder="" />
            </div>
            <div class="space-y-2">
              <Label>Fonction de la société* :</Label>
              <Input :class="{'border-red-500': v$.fonction.$error}" v-model="dataToSend.fonction" type="text" placeholder="" />
            </div>
            <div class="space-y-2">
              <Label>Domaine de la société* :</Label>
              <Input :class="{'border-red-500': v$.domaine.$error}" v-model="dataToSend.domaine" type="text" placeholder="" />
            </div>
            <div class="space-y-2">
              <Label>Où vend-il ?* :</Label>
              <Input :class="{'border-red-500': v$.lieu_vente.$error}" v-model="dataToSend.lieu_vente" type="text" placeholder="" />
            </div>
            <div class="space-y-2">
              <Label>Resultat net* :</Label>
              <Input :class="{'border-red-500': v$.resultat_net.$error}" v-model="dataToSend.resultat_net" type="text" placeholder="" />
            </div>
            <div class="space-y-2">
              <Label>Date de création entreprise* :</Label>
              <VueDatePicker
                :class="{'error-input': v$.date_creation.$error}"
                v-model="dataToSend.date_creation"
                :enable-time-picker="false"
                locale="fr-FR"
                format="dd/MM/yyyy"
                cancel-text="Retour"
                select-text="Sélectionner"
                placeholder="--/--/----"
              />
            </div>
            <div class="space-y-2">
              <Label for="phone_number">Produits vendus* :</Label>
              <Input :class="{'border-red-500': v$.produit_vendu.$error}" v-model="dataToSend.produit_vendu" id="phone_number" type="text" placeholder="" />
            </div>
            <div class="space-y-2">
              <Label for="phone_number">Taille de l'entreprise* :</Label>
              <Input :class="{'border-red-500': v$.taille_entreprise.$error}" v-model="dataToSend.taille_entreprise" id="phone_number" type="text" placeholder="" />
            </div>
            <div class="space-y-2">
              <Label for="phone_number">Tarif de ses prestations* :</Label>
              <Input :class="{'border-red-500': v$.tarif_prestation.$error}" v-model="dataToSend.tarif_prestation" id="phone_number" type="text" placeholder="" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-base font-semibold">Commentaire</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2">
              <Label for="lead-comment">Commentaire :</Label>
              <Textarea
                id="lead-comment"
                type="textArea"
                placeholder="Commentaire"
                :class="{'border-red-500': v$.commentaire.$error}"
                v-model="dataToSend.commentaire"
              />
            </CardContent>
          </Card>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { VueTelInput } from 'vue-tel-input';
import 'vue-tel-input/vue-tel-input.css';
import { ref, watch, toRefs } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import { applyFullNameDefaults } from '~/features/leads/utils/full-name';
import type { LeadStatusValue } from '~/constants/lead-statuses';

const props = defineProps<{
  dataToSend: Record<string, any>;
  v$: any;
  statusOptions: { label: string; value: LeadStatusValue }[];
  rdvTypeOptions: { label: string; value: string }[];
  statusSelections: Record<LeadStatusValue, boolean>;
  statusDates: Record<LeadStatusValue, Date | null>;
  rdvOccurrences: (Date | null)[];
}>();

const emit = defineEmits<{
  (e: 'toggle-status', name: LeadStatusValue, checked: boolean): void;
  (e: 'update-status-date', name: LeadStatusValue, date: Date | null): void;
  (e: 'add-rdv-occurrence'): void;
  (e: 'remove-rdv-occurrence', index: number): void;
  (e: 'update-rdv-occurrence', index: number, date: Date | null): void;
}>();

const { dataToSend, v$, statusOptions, rdvTypeOptions, statusSelections, statusDates, rdvOccurrences } = toRefs(props);

const emitToggleStatus = (name: LeadStatusValue, checked: boolean) => {
  emit('toggle-status', name, checked)
}

const emitUpdateStatusDate = (name: LeadStatusValue, date: Date | null) => {
  emit('update-status-date', name, date)
}

const emitAddRdvOccurrence = () => {
  emit('add-rdv-occurrence')
}

const emitUpdateRdvOccurrence = (index: number, date: Date | null) => {
  emit('update-rdv-occurrence', index, date)
}

type StatusDateInput = Date | Date[] | null

const onStatusDateInput = (name: LeadStatusValue, value: StatusDateInput) => {
  const normalized = Array.isArray(value) ? value[0] ?? null : value
  emitUpdateStatusDate(name, normalized ?? null)
}

const onRdvOccurrenceInput = (index: number, value: StatusDateInput) => {
  const normalized = (Array.isArray(value) ? value[0] : value) ?? null

  if (!normalized) {
    if (index > 0) {
      emit('remove-rdv-occurrence', index)
      return
    }

    emitUpdateRdvOccurrence(index, null)
    return
  }

  emitUpdateRdvOccurrence(index, normalized)
}

const getRdvOccurrenceLabel = (index: number) => (index === 0 ? '1er RDV' : `${index + 1}ème RDV`)

const STATUS_DATE_LABELS: Partial<Record<LeadStatusValue, string>> = {
  Devis: 'Envoyé le:',
  Paiement: 'Envoyé le:',
  RDV: 'Fait le:',
  'RDV stratégique': 'Fait le:',
  'RDV strategique': 'Fait le:',
  'Facture': 'Envoyée le:',
}

const getStatusDateLabel = (value: LeadStatusValue) => STATUS_DATE_LABELS[value] ?? 'Le:'

const addressResults = ref<AddressFeature[]>([]);
const isFetchingAddress = ref(false);

interface AddressFeatureProperties {
  id: string | number;
  label: string;
  citycode?: string;
  type?: string;
  street?: string;
  district?: string;
  city?: string;
  postcode?: string;
}

interface AddressFeature {
  properties: AddressFeatureProperties;
}

interface AddressApiResponse {
  features?: AddressFeature[];
}

watch(() => dataToSend.value.localisation_societe, async (val) => {
  if (val && val.length > 2) {
    isFetchingAddress.value = true;
    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(val)}&limit=50&autocomplete=1`);
      const data = (await res.json()) as AddressApiResponse;
      addressResults.value = Array.isArray(data.features) ? data.features : [];
    } catch {
      addressResults.value = [];
    } finally {
      isFetchingAddress.value = false;
    }
  } else {
    addressResults.value = [];
    isFetchingAddress.value = false;
  }
});

function selectAddress(item: AddressFeature) {
  dataToSend.value.localisation_societe = item.properties.label;
  dataToSend.value.citycode = item.properties.citycode || '';
  dataToSend.value.type = item.properties.type || '';
  dataToSend.value.street = item.properties.street || '';
  dataToSend.value.district = item.properties.district || '';
  dataToSend.value.city = item.properties.city || '';
  dataToSend.value.postcode = item.properties.postcode || '';
  dataToSend.value.label = item.properties.label || '';
  addressResults.value = [];
}

watch(
  () => dataToSend.value.full_name,
  (fullName) => {
    applyFullNameDefaults({
      fullName,
      currentFirstName: dataToSend.value.prenom,
      currentLastName: dataToSend.value.nom,
      onFirstNameUpdate: (value) => {
        dataToSend.value.prenom = value;
      },
      onLastNameUpdate: (value) => {
        dataToSend.value.nom = value;
      },
    });
  },
  { immediate: true }
);
</script>
