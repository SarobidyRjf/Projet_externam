export const LEAD_STATUS_VALUES = [
  'Nouveau lead',
  'Facture',
  'RDV',
  'Closing',
  'Devis',
  'Paiement',
  'RDV strategique',
  'RDV stratégique',
  'montage',
  'marketing',
  'Hors cible'
] as const;

export type LeadStatusValue = (typeof LEAD_STATUS_VALUES)[number];

const DISPLAY_STATUS_SEQUENCE: LeadStatusValue[] = [
  'Nouveau lead',
  'Hors cible',
  'RDV',
  'Closing',
  'Devis',
  'Facture',
  'Paiement',
  'RDV stratégique',
  'montage',
  'marketing',
  
];

const LABEL_OVERRIDES: Partial<Record<LeadStatusValue, string>> = {
  montage: 'Montage',
  marketing: 'Marketing',
  'RDV strategique': 'RDV stratégique',
  Facture : 'Facture ( en attente de paiement) '
};

export const LEAD_STATUS_OPTIONS = DISPLAY_STATUS_SEQUENCE.map((value) => ({
  value,
  label: LABEL_OVERRIDES[value] ?? value
}));

export const NORMALIZED_STATUS_MAP = new Map<LeadStatusValue, LeadStatusValue>([
  ['RDV strategique', 'RDV stratégique']
]);

export const normalizeLeadStatus = (status: string | null | undefined): LeadStatusValue | null => {
  if (!status) {
    return null;
  }

  const statusValue = LEAD_STATUS_VALUES.find((value) => value === status);
  if (!statusValue) {
    return null;
  }

  return NORMALIZED_STATUS_MAP.get(statusValue) ?? statusValue;
};
