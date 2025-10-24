export const RDV_TYPE_OPTIONS = [
  { label: 'Présentiel', value: 'presentiel' },
  { label: 'Visio', value: 'visio' },
  { label: 'Appel', value: 'appel' },
  { label: 'Déplacement', value: 'deplacement' },
  { label: 'Sur place', value: 'sur_place' },
] as const;

export const RDV_TYPE_LABELS = RDV_TYPE_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<string, string>
);
