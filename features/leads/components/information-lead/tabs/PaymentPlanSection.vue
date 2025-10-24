<template>
  <div class="mt-8 space-y-6">
    <!-- Choix de pack -->
    <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <div>
        <h3 class="text-sm font-semibold text-slate-600">Choix de pack</h3>
        <p class="text-xs text-muted-foreground">
          Choisissez un pack puis précisez les éléments si besoin de personnalisation.
        </p>
      </div>

      <div class="space-y-2">
        <Label for="pack-choice">Choisissez un pack</Label>
        <Select v-model="selectedPack">
          <SelectTrigger id="pack-choice" class="w-64">
            <SelectValue placeholder="Sélectionner un pack" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in packOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div v-if="isPackCustomizable" class="justify-self-start grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="custom-video-count">Nombre de vidéos</Label>
          <div class="w-full sm:w-32">
            <Input
              id="custom-video-count"
              v-model="customVideoCount"
              type="number"
              min="0"
              placeholder="Ex. 5"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="custom-price">Prix personnalisé</Label>
          <div class="flex items-center gap-2">
            <div class="w-full sm:w-40">
              <Input
                id="custom-price"
                v-model="customPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex. 499"
              />
            </div>
            <span class="text-sm text-muted-foreground">€ HT</span>
          </div>

          <div v-if="priceReductionInfo.hasReduction" class="space-y-1 text-xs text-emerald-600">
            <p>Soit {{ priceReductionInfo.formattedAmount }} de réduction</p>
            <p>Soit {{ priceReductionInfo.formattedPercent }} % de remise</p>
          </div>
        </div>

        <div class="sm:col-span-2 space-y-2">
          <Label for="marketing-support-count">Accompagnement marketing</Label>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="space-y-1">
              <span class="text-xs text-muted-foreground">Nombre</span>
              <Input
                id="marketing-support-count"
                v-model="marketingSupportCount"
                type="number"
                min="0"
                placeholder="Ex. 2"
              />
            </div>
            <div class="space-y-1">
              <Label for="marketing-support-price-ht" class="text-xs text-muted-foreground">Prix HT</Label>
              <div class="flex items-center gap-2">
                <Input
                  id="marketing-support-price-ht"
                  v-model="marketingSupportPriceHt"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex. 299"
                />
                <span class="text-sm text-muted-foreground">€ HT</span>
              </div>
            </div>
            <div class="space-y-1">
              <Label for="marketing-support-price-ttc" class="text-xs text-muted-foreground">Prix TTC</Label>
              <div class="flex items-center gap-2">
                <Input
                  id="marketing-support-price-ttc"
                  v-model="marketingSupportPriceTtc"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex. 358.8"
                />
                <span class="text-sm text-muted-foreground">€ TTC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="leadId" class="flex justify-end">
        <Button
          :disabled="isSaving || !isPackDirty"
          class="w-full sm:w-auto"
          @click="savePlan"
        >
          Sauvegarder le pack
        </Button>
      </div>
    </div>

    <!-- Paiement en plusieurs fois -->
    <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <div>
        <h3 class="text-sm font-semibold text-slate-600">Paiement en plusieurs fois</h3>
        <p class="text-xs text-muted-foreground">
          Indiquez le nombre d'échéances puis détaillez chaque paiement, le pourcentage est calculé automatiquement.
        </p>
      </div>

      <div class="space-y-2">
        <Label for="payment-count">Paiement en X fois</Label>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-600">X =</span>
            <div class="w-full sm:w-24">
              <Input
                id="payment-count"
                v-model.number="paymentCount"
                type="number"
                min="1"
                placeholder="Ex. 3"
              />
            </div>
          </div>
          <span class="text-xs text-muted-foreground">Nombre d'échéances prévues.</span>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="(payment, index) in paymentDetails"
          :key="`payment-${index}`"
          class="rounded-md border border-slate-100 bg-slate-50/60 p-3 space-y-2"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span class="text-sm font-medium text-slate-600">{{ paymentLabel(payment.installmentNumber ?? index + 1) }} =</span>
            <div class="flex items-center gap-2">
              <div class="w-full sm:w-40">
                <Input
                  :id="`payment-amount-${index}`"
                  v-model="payment.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Montant"
                />
              </div>
              <span class="text-sm text-muted-foreground">€</span>
            </div>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span class="text-sm font-medium text-slate-600">Soit =</span>
            <span class="text-sm text-muted-foreground">{{ formatPaymentPercentage(payment.amount) }} %</span>
          </div>
        </div>
      </div>

      <div
        class="flex items-center gap-2 rounded-md border px-3 py-2 text-xs sm:text-sm"
        :class="
          isPaymentComplete
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 bg-slate-50 text-muted-foreground'
        "
      >
        <CheckCircle2 v-if="isPaymentComplete" class="h-4 w-4 text-emerald-500" />
        <Clock v-else class="h-4 w-4 text-muted-foreground" />
        <span :class="isPaymentComplete ? 'font-medium' : 'italic'">
          {{ isPaymentComplete ? `Tout est payé (${formattedTotalPaid})` : `Reste à payer : ${formattedRemainingAmount}` }}
        </span>
      </div>

      <div v-if="leadId" class="flex justify-end">
        <Button
          :disabled="isSaving || !isPaymentDirty"
          class="w-full sm:w-auto"
          @click="savePlan"
        >
          Sauvegarder le plan de paiement
        </Button>
      </div>

      <p v-if="leadId" class="text-xs text-muted-foreground">{{ saveStatusMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, toRefs } from 'vue';
import { CheckCircle2, Clock } from 'lucide-vue-next';
import { useDebounceFn } from '@vueuse/core';
import { PAYMENT_PACK_DEFAULTS, PAYMENT_PACK_OPTIONS, type PaymentPackValue } from '~/constants/payment-packs';
import { useLeadPaymentPlanStore, type LeadPaymentPlan, type UpsertPaymentPlanPayload } from '~/stores/leads/paymentPlan';

const props = withDefaults(defineProps<{
  leadId?: string;
  initialPlan?: LeadPaymentPlan | null;
}>(), { leadId: undefined, initialPlan: null });

const { leadId, initialPlan } = toRefs(props);
const paymentPlanStore = useLeadPaymentPlanStore();

const packOptions = PAYMENT_PACK_OPTIONS;
const customizablePackValues = new Set(packOptions.map((o) => o.value));

type PackCustomValues = Record<PaymentPackValue, { videoCount: string; price: string }>;

const createDefaultCustomValues = (): PackCustomValues =>
  packOptions.reduce((acc, option) => {
    acc[option.value] = {
      videoCount: option.defaults.videoCount.toString(),
      price: option.defaults.price.toString(),
    };
    return acc;
  }, {} as PackCustomValues);

const defaultSelectedPack = (packOptions[0]?.value ?? 'premium') as PaymentPackValue;
const selectedPack = ref<PaymentPackValue>(defaultSelectedPack);
const isPackCustomizable = computed(() => customizablePackValues.has(selectedPack.value));

// stockage des valeurs personnalisées par pack
const customValuesByPack = ref<PackCustomValues>(createDefaultCustomValues());
const customVideoCount = ref(customValuesByPack.value[selectedPack.value].videoCount);
const customPrice = ref(customValuesByPack.value[selectedPack.value].price);

type PaymentDetailForm = { amount: string; installmentNumber: number };

const createEmptyPaymentDetail = (index: number): PaymentDetailForm => ({ amount: '', installmentNumber: index + 1 });

const paymentCount = ref(1);
const paymentDetails = ref<PaymentDetailForm[]>([createEmptyPaymentDetail(0)]);
const marketingSupportCount = ref('');
const marketingSupportPriceHt = ref('');
const marketingSupportPriceTtc = ref('');
const isHydrating = ref(false);
const isSaving = ref(false);
const saveStatusMessage = ref('Sauvegarde automatique activée');
let scheduleSave: ReturnType<typeof useDebounceFn>;

// formatters
const currencyFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const percentageFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const toStringOrFallback = (value: number | null | undefined, fallback: string) =>
  value === null || value === undefined ? fallback : String(value);

const sanitizeCustomPrice = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
};

const sanitizeCustomVideoCount = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed);
};

// fonctions utilitaires
const paymentLabel = (installmentNumber: number) => (installmentNumber === 1 ? '1er paiement' : `${installmentNumber}e paiement`);
const resolvePackDefaults = (value: string) => PAYMENT_PACK_DEFAULTS[value as PaymentPackValue] ?? null;
const applyPackDefaults = (value: PaymentPackValue) => {
  const defaults = resolvePackDefaults(value);
  if (!defaults) return;
  const defaultValues = {
    videoCount: defaults.videoCount.toString(),
    price: defaults.price.toString(),
  };
  customValuesByPack.value = {
    ...customValuesByPack.value,
    [value]: defaultValues,
  };
  customVideoCount.value = defaultValues.videoCount;
  customPrice.value = defaultValues.price;
};

// récupération de la réduction
const priceReductionInfo = computed(() => {
  const defaults = resolvePackDefaults(selectedPack.value);
  if (!defaults) return { hasReduction: false, amount: 0, percent: 0, formattedAmount: '', formattedPercent: '' };
  const difference = defaults.price - Number(customPrice.value || 0);
  if (difference <= 0) return { hasReduction: false, amount: 0, percent: 0, formattedAmount: '', formattedPercent: '' };
  const percent = (difference / defaults.price) * 100;
  return { hasReduction: true, amount: difference, percent, formattedAmount: currencyFormatter.format(difference), formattedPercent: percentageFormatter.format(percent) };
});

const effectivePrice = computed(() => {
  const sanitized = sanitizeCustomPrice(customPrice.value);
  if (sanitized !== null) return sanitized;
  const defaults = resolvePackDefaults(selectedPack.value);
  return defaults?.price ?? 0;
});

const computePaymentPercentage = (amount: string) => {
  const total = effectivePrice.value;
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || total <= 0) return 0;
  const percentage = (parsedAmount / total) * 100;
  const boundedPercentage = Math.min(100, Math.max(0, percentage));
  return Number.isFinite(boundedPercentage) ? boundedPercentage : 0;
};

const formatPaymentPercentage = (amount: string) => percentageFormatter.format(computePaymentPercentage(amount));

const totalPaid = computed(() =>
  paymentDetails.value.reduce((sum, detail) => {
    const amount = Number(detail.amount);
    if (!Number.isFinite(amount) || amount <= 0) return sum;
    return sum + amount;
  }, 0)
);

const remainingAmount = computed(() => {
  const remaining = effectivePrice.value - totalPaid.value;
  return remaining > 0 ? remaining : 0;
});

const isPaymentComplete = computed(() => effectivePrice.value > 0 && remainingAmount.value === 0);
const formattedTotalPaid = computed(() => `${currencyFormatter.format(totalPaid.value)} HT`);
const formattedRemainingAmount = computed(() => `${currencyFormatter.format(remainingAmount.value)} HT`);

// signature pour dirty check
const createPackSignature = (pack: { packType: string; videoCount: string | number; price: string | number }) =>
  JSON.stringify({ packType: pack.packType, videoCount: String(pack.videoCount ?? ''), price: String(pack.price ?? '') });

const packStateSignature = computed(() => createPackSignature({ packType: selectedPack.value, videoCount: customVideoCount.value, price: customPrice.value }));

const createMarketingSignature = (values: { count: string; priceHt: string; priceTtc: string }) =>
  JSON.stringify({ count: values.count ?? '', priceHt: values.priceHt ?? '', priceTtc: values.priceTtc ?? '' });

const marketingStateSignature = computed(() =>
  createMarketingSignature({
    count: marketingSupportCount.value,
    priceHt: marketingSupportPriceHt.value,
    priceTtc: marketingSupportPriceTtc.value,
  })
);

const createSavedSignatures = (values: PackCustomValues) =>
  packOptions.reduce((acc, option) => {
    acc[option.value] = createPackSignature({
      packType: option.value,
      videoCount: values[option.value].videoCount,
      price: values[option.value].price,
    });
    return acc;
  }, {} as Record<PaymentPackValue, string>);

const savedPackSignatures = ref<Record<PaymentPackValue, string>>(createSavedSignatures(customValuesByPack.value));
const savedMarketingSignature = ref(marketingStateSignature.value);
const isPackDirty = computed(
  () =>
    packStateSignature.value !== savedPackSignatures.value[selectedPack.value] ||
    marketingStateSignature.value !== savedMarketingSignature.value
);

const createPaymentSignature = (count: number, details: PaymentDetailForm[]) =>
  JSON.stringify({
    count,
    payments: details.map(detail => ({ amount: detail.amount, installmentNumber: detail.installmentNumber })),
  });

const paymentStateSignature = computed(() => createPaymentSignature(paymentCount.value, paymentDetails.value));
const savedPaymentSignature = ref(paymentStateSignature.value);
const isPaymentDirty = computed(() => paymentStateSignature.value !== savedPaymentSignature.value);

// sauvegarde pack
const normalizePaymentCount = (value: number) => {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.round(value));
};

watch(paymentCount, (nextCount) => {
  if (isHydrating.value) return;
  const normalized = normalizePaymentCount(nextCount);
  if (normalized !== nextCount) {
    paymentCount.value = normalized;
    return;
  }

  const details = paymentDetails.value.slice(0, normalized).map((detail, index) => ({
    ...detail,
    installmentNumber: index + 1,
  }));

  while (details.length < normalized) {
    details.push(createEmptyPaymentDetail(details.length));
  }

  paymentDetails.value = details;
});

const savePlan = async () => {
  if (!leadId.value) return;
  const sanitizedVideoCount = sanitizeCustomVideoCount(customVideoCount.value);
  const sanitizedPrice = effectivePrice.value;
  const sanitizedMarketingSupportCount = sanitizeCustomVideoCount(marketingSupportCount.value);
  const sanitizedMarketingSupportPriceHt = sanitizeCustomPrice(marketingSupportPriceHt.value);
  const sanitizedMarketingSupportPriceTtc = sanitizeCustomPrice(marketingSupportPriceTtc.value);
  const customPackValuesPayload = packOptions.reduce<NonNullable<UpsertPaymentPlanPayload['customPackValues']>>((acc, option) => {
    const packValue = option.value;
    const values = customValuesByPack.value[packValue];
    acc[packValue] = {
      videoCount: sanitizeCustomVideoCount(values.videoCount),
      price: sanitizeCustomPrice(values.price),
    };
    return acc;
  }, {} as NonNullable<UpsertPaymentPlanPayload['customPackValues']>);

  const payload: UpsertPaymentPlanPayload = {
    packType: selectedPack.value,
    videoCount: sanitizedVideoCount ?? 0,
    price: sanitizedPrice ?? 0,
    paymentCount: paymentCount.value,
    payments: paymentDetails.value.map((detail, index) => {
      const amount = Number(detail.amount);
      const sanitizedAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
      const total = effectivePrice.value;
      const rawPercentage = total > 0 ? (sanitizedAmount / total) * 100 : 0;
      const boundedPercentage = Math.min(100, Math.max(0, rawPercentage));
      const percentage = Number.isFinite(boundedPercentage) ? Number(boundedPercentage.toFixed(2)) : 0;
      const installmentNumber = Number.isFinite(detail.installmentNumber)
        ? Math.max(1, Math.round(detail.installmentNumber))
        : index + 1;
      return { amount: sanitizedAmount, remaining: percentage, installmentNumber };
    }),
    customPackValues: customPackValuesPayload,
    marketingSupportCount: sanitizedMarketingSupportCount ?? null,
    marketingSupportPriceHt: sanitizedMarketingSupportPriceHt ?? null,
    marketingSupportPriceTtc: sanitizedMarketingSupportPriceTtc ?? null,
  };
  isSaving.value = true;
  try {
    const plan = await paymentPlanStore.upsertPaymentPlan(leadId.value, payload);
    applyPlan(plan);
    saveStatusMessage.value = `Plan de paiement sauvegardé à ${new Date().toLocaleTimeString()}`;
  } catch {
    saveStatusMessage.value = 'Erreur lors de la sauvegarde du plan de paiement.';
  } finally { isSaving.value = false; }
};

// watcher pour changer de pack
watch(selectedPack, (newPack) => {
  if (isHydrating.value) return;

  const packValues = customValuesByPack.value[newPack];
  if (packValues) {
    customVideoCount.value = packValues.videoCount;
    customPrice.value = packValues.price;
  } else {
    applyPackDefaults(newPack);
  }
});

// synchronise les valeurs personnalisées quand l'utilisateur modifie les champs
watch([customVideoCount, customPrice], ([videoCount, price]) => {
  if (isHydrating.value) return;
  customValuesByPack.value = {
    ...customValuesByPack.value,
    [selectedPack.value]: { videoCount, price },
  };
});

// init plan depuis store / props
const computeCustomValuesFromPlan = (plan: LeadPaymentPlan | null): PackCustomValues => {
  const nextValues = createDefaultCustomValues();
  if (!plan) return nextValues;

  const entries = Object.entries(plan.customPackValues ?? {}) as [PaymentPackValue, { price: number | null | undefined; videoCount: number | null | undefined }][];
  for (const [pack, customization] of entries) {
    if (!customization || !(pack in nextValues)) continue;
    const defaults = nextValues[pack];
    nextValues[pack] = {
      videoCount: toStringOrFallback(customization.videoCount, defaults.videoCount),
      price: toStringOrFallback(customization.price, defaults.price),
    };
  }

  const packType = plan.packType;
  if (nextValues[packType]) {
    const current = nextValues[packType];
    nextValues[packType] = {
      videoCount: toStringOrFallback(plan.videoCount, current.videoCount),
      price: toStringOrFallback(plan.price, current.price),
    };
  }

  return nextValues;
};

const applyPlan = (plan: LeadPaymentPlan | null) => {
  isHydrating.value = true;
  try {
    const nextCustomValues = computeCustomValuesFromPlan(plan);

    if (plan) {
      const resolvedPack = customizablePackValues.has(plan.packType) ? plan.packType : defaultSelectedPack;
      selectedPack.value = resolvedPack;

      const resolvedPaymentCount = Math.max(1, plan.paymentCount ?? 1);
      paymentCount.value = resolvedPaymentCount;
      const details = (plan.payments ?? [])
        .slice(0, resolvedPaymentCount)
        .map((p, index) => ({
          amount: toStringOrFallback(p.amount, ''),
          installmentNumber: Number.isFinite(Number(p.installmentNumber)) ? Math.max(1, Math.round(Number(p.installmentNumber))) : index + 1,
        }));
      while (details.length < resolvedPaymentCount) {
        details.push(createEmptyPaymentDetail(details.length));
      }
      paymentDetails.value = details.map((detail, index) => ({ ...detail, installmentNumber: index + 1 }));
    } else {
      paymentCount.value = 1;
      paymentDetails.value = [createEmptyPaymentDetail(0)];
    }

    customValuesByPack.value = nextCustomValues;
    savedPackSignatures.value = createSavedSignatures(nextCustomValues);
    const selectedValues = customValuesByPack.value[selectedPack.value] ?? { videoCount: '', price: '' };
    customVideoCount.value = selectedValues.videoCount;
    customPrice.value = selectedValues.price;
    marketingSupportCount.value = toStringOrFallback(plan?.marketingSupportCount, '');
    marketingSupportPriceHt.value = toStringOrFallback(plan?.marketingSupportPriceHt, '');
    marketingSupportPriceTtc.value = toStringOrFallback(plan?.marketingSupportPriceTtc, '');
    savedMarketingSignature.value = marketingStateSignature.value;
    savedPaymentSignature.value = createPaymentSignature(paymentCount.value, paymentDetails.value);
  } finally { isHydrating.value = false; }
};

const resolveAndApplyPlan = async () => {
  if (!leadId.value) { applyPlan(null); return; }

  let plan = paymentPlanStore.plans[leadId.value] ?? initialPlan.value ?? null;
  if (!plan) {
    try { plan = await paymentPlanStore.fetchPaymentPlan(leadId.value); } catch { plan = null; }
  }
  applyPlan(plan);
};

// initialisation
resolveAndApplyPlan();

scheduleSave = useDebounceFn(() => savePlan(), 800);

onBeforeUnmount(() => scheduleSave?.());
</script>
