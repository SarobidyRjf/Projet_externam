import type { Date } from 'mongoose';
import { defineStore } from 'pinia';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useLeadHistory } from '~/stores/leads/history';

interface LeadAttribution {
  id_lead: string;
  created_time: string;
  full_name: string;
  email: string;
  phone_number: string;
  chiffre_affaire?: string;
  ca_valeur_min?: number;
  ca_valeur_max?: number;
  unite?: string;
}

export interface LeadInfo {
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  objectif_client: string;
  nom_societe: string;
  localisation_societe: string;
  citycode: string;
  type: string;
  street: string;
  district: string;
  city: string;
  postcode: string;
  label: string;
  panier: string;
  chiffre_affaire: string;
  fonction: string;
  domaine: string;
  date_creation: string;
  lieu_vente: string;
  resultat_net: string;
  produit_vendu: string;
  taille_entreprise: string;
  tarif_prestation: string;
  type_lieu_rdv: string;
  lieu_rdv: string | null;
  date_rdv: string;
  canaux_marketing: string;
  lien_fb: string;
  lien_insta: string;
  lien_tiktok: string;
  lien_linkedin: string;
  lien_siteweb: string;
  commentaire: string;
  status: string | null;
  statuses: { name: string; date: string | Date }[];
  note_R1: string;
  date_rdv_R1?: string | Date | null;
  note_R2: string;
  date_rdv_R2?: string | Date | null;
  note_R3: string;
  note_RDV_strategique: string;
  date_rdv_RDVstat?: string | Date | null;
  note_paiements: string;
  date_rdv_paiement?: string | Date | null;
}

export const useLeadsStore = defineStore('leadsStore', {
  state: () => ({
      leadsData: [] as Array<any>,
      leadByUser: [] as Array<any>,
      leadUpdated: {} as any,
      loading: false,
      total: 0,
      totalmanage: 0
  }),
    actions: {
        async getAllLeads(page= 1, limit= 20, startDate?: String, endDate?: String, phonePrefix?: String[], caMin?: number, caMax?: number, unite?: string, search?: string) {
            try {
                this.loading = true
                const res = await $fetch('/api/leadMeta/externam', {
                    params: {
                        page,
                        limit,
                        startDate,
                        endDate,
                        phonePrefix,
                        caMin,
                        caMax,
                        unite,
                        search
                    }
                })
                this.leadsData = res?.data || res
                this.total = res.total
            } catch(err) {
                console.log(err)
            }
            finally {
                this.loading = false
            }
        },

        async attribuateLead(selectedLeads: LeadAttribution[], userId: string | null) {
            try {
                this.loading = true
                const res = await $fetch('/api/leadMeta/attribution/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        leads: selectedLeads,
                        user_id: userId
                    })
                    
                });
                toast.success(res?.message, {
                    position: 'top-right', 
                    theme: 'auto',
                    transition: 'slide',
                });
            } catch (err: any) {
                console.error(err);
                toast.error(err?.data.statusMessage, {
                    position: 'top-right',
                    theme: 'auto',
                });
            } finally {
                this.loading = false;
            }
        },

        async getLeadsByUser(userId: string, page = 1, limit = 20, status?: string[], search?: string, caMin?: number, caMax?: number, unite?: string, prospectLevel?: number, departmentCode?: string, regionCode?: string ) {
            try {
                this.loading = true
                const res:any = await $fetch(`/api/leadMeta/manage/${userId}`, {
                    params: {
                        page,
                        limit,
                        status,
                        search,
                        caMin,
                        caMax,
                        unite,
                        prospectLevel,
                        departmentCode,
                        regionCode
                    }
                })
                this.leadByUser = res?.data || res
                this.totalmanage = res?.total
                console.log(res, 'res')
            } catch(err) {
                console.log(err)
            }
            finally {
                this.loading = false
            }
        },

        async addInfoLead(leadId: string, body: any, options?: { silent?: boolean; skipHistory?: boolean; showLoading?: boolean }) {
            const { silent = false, skipHistory = false, showLoading = true } = options || {}
            try {
                if (showLoading) {
                    this.loading = true
                }
                const res = await $fetch('/api/leadMeta/manage/addInfo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id_lead: leadId,
                        ...body
                    })
                });
                if (!silent) {
                    toast.success(res?.message, {
                        position: 'top-right',
                        theme: 'auto',
                        transition: 'slide',
                    });
                }
                if (!skipHistory) {
                    const history = useLeadHistory()
                    const fields = Object.keys(body || {}).filter(f => f !== 'id_lead')
                    await history.addHistory(leadId, 'a ajouté des informations au lead', fields)
                }
                return res;
            }
            catch (err: any) {
                console.error(err);
                if (!silent) {
                    toast.error(err?.data?.statusMessage || 'Une erreur est survenue', {
                        position: 'top-right',
                        theme: 'auto',
                    });
                }
            } finally {
                if (showLoading) {
                    this.loading = false;
                }
            }
        }
    }
});