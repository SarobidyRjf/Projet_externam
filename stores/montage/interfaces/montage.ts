import type { MontageScriptState } from './script';
import { defaultScriptState } from './script';
import type { MontageUserSummary } from './user';

export interface MontageDetails {
  _id: string | null;
  lead: string;
  assignedMonteurs: MontageUserSummary[];
  script: MontageScriptState;
}

export interface SaveMontageResult {
  message: string;
  montage: MontageDetails;
}

export const defaultMontageDetails = (leadId: string): MontageDetails => ({
  _id: null,
  lead: leadId,
  assignedMonteurs: [],
  script: defaultScriptState(),
});
