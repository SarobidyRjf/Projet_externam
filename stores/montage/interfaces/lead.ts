export interface MontageLeadParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface MontageLead {
  _id: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  status?: string;
  date_rdv?: string;
  [key: string]: any;
}

export interface MontageLeadResponse {
  data: MontageLead[];
  total: number;
  page: number;
  limit: number;
}
