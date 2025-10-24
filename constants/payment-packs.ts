export const PAYMENT_PACK_DEFAULTS = {
  premium: { price: 5000, videoCount: 6 },
  visibility: { price: 2000, videoCount: 3 },
  boost: { price: 1000, videoCount: 1 },
} as const;

export type PaymentPackValue = keyof typeof PAYMENT_PACK_DEFAULTS;
export type PaymentPackDefaults = typeof PAYMENT_PACK_DEFAULTS[PaymentPackValue];

export type PaymentPackOption = {
  label: string;
  value: PaymentPackValue;
  defaults: PaymentPackDefaults;
};

export const PAYMENT_PACK_OPTIONS: PaymentPackOption[] = [
  { label: `Pack Premium - ${PAYMENT_PACK_DEFAULTS.premium.price}€ HT `, value: 'premium', defaults: PAYMENT_PACK_DEFAULTS.premium },
  { label: `Pack Visibilité - ${PAYMENT_PACK_DEFAULTS.visibility.price}€ HT `, value: 'visibility', defaults: PAYMENT_PACK_DEFAULTS.visibility },
  { label: `Pack Boost - ${PAYMENT_PACK_DEFAULTS.boost.price}€ HT `,value: 'boost', defaults: PAYMENT_PACK_DEFAULTS.boost },
];
