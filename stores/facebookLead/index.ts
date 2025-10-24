import { defineStore } from 'pinia';
import { number } from 'zod';

export const useFacebookLeadStore = defineStore('facebookLead', {
  state: () => ({
      leads: [] as Array<any>,
      accounts: {} as { data: Array<any> },
      formLeads: {} as { data: Array<any> },
      accountAccessToken: '',
      idPage: null,
      idForm: null,
      loading : false
  }),
  actions: {
      async fetchAccounts() {
          const config = useRuntimeConfig();
          const url = config.public.meta_URL_API
          const accessToken = config.public.accessToken_META
        try {
            this.loading = true;
            const response = await fetch(`${url}/v23.0/me/accounts?access_token=${accessToken}`);
            if (!response.ok) {
            throw new Error('Failed to fetch leads');
            }
            this.accounts = await response.json();
            this.accountAccessToken = this.accounts.data?.[0]?.access_token;
            this.idPage = this.accounts.data?.[0]?.id;
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
        finally {
            this.loading = false;
        }
      },
      
      async fetchFormLeads() {
          const config = useRuntimeConfig();
          const url = config.public.meta_URL_API
          const accessToken = config.public.accessToken_META
        try {
            this.loading = true;
            const response = await fetch(`${url}/v23.0/${this.idPage}/leadgen_forms?access_token=${this.accountAccessToken}`);
            if (!response.ok) {
            throw new Error('Failed to fetch leads');
            }
            this.formLeads = await response.json();
            this.idForm = this.formLeads.data?.[0]?.id;
            console.log(this.idForm, "ID du formulaire récupéré");
            console.log(this.formLeads, "ID du formulaire récupéré");
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
        finally {
            this.loading = false;
        }
      },

      async fetchLeadsData() {
          const config = useRuntimeConfig();
          const url = config.public.meta_URL_API
          const accessToken = config.public.accessToken_META
        try {
            this.loading = true;
            const formIds = this.formLeads?.data?.map(f => f.id) || []
            if (formIds.length === 0) {
                console.warn("Aucun formulaire trouvé");
                return;
            }

            const responses = await Promise.all(
                formIds.map(async (formId) => {
                    const response = await fetch(`${url}v19.0/${formId}/leads?access_token=${accessToken}`);
                    if (!response.ok) {
                    throw new Error(`Failed to fetch leads for form ${formId}`);
                    }
                    const data = await response.json();
                    console.log(`Leads reçus de Meta pour le form ${formId}:`, data.data);
                    return data.data || [];
                })
            );

            // fusionner tous les leads
            this.leads = responses.flat(); 

            await fetch('/api/leadMeta/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: this.leads })
            });
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
        finally {
            this.loading = false;
        }
      },

    //   async fetchLeadsData() {
    //       const config = useRuntimeConfig();
    //       const url = config.public.meta_URL_API
    //       const accessToken = config.public.accessToken_META
    //     try {
    //         this.loading = true;
    //         const response = await fetch(`${url}v19.0/${this.idForm}/leads?access_token=${accessToken}`);
    //         // const response = await fetch('https://graph.facebook.com/v19.0/2130592534109437/leads?access_token=EAAJmOSKZBz0kBPC7W7tC2Gh7s7odZByF7gvKoQLX0BZAgRetL87eFZBKAJREDKSdZCUTnGJ2K87z7aUr10ESDkdtdGCNtnc73BS3O5DLySyj3Wz2ZAseNFhCXgN9aPMFF6akecKmiNKIrrKm1mvGP67RgkaUHNLwxZAiyUD4k8rhV10DVldnFbrjEQ0qUNMIrnv')
    //         if (!response.ok) {
    //         throw new Error('Failed to fetch leads');
    //         }
    //         console.log(this.idForm, "ID du formulaire récupéré");
    //         const data = await response.json();
    //         this.leads = data;

    //         console.log("Leads reçus de Meta:", data.data)
    //         await fetch('/api/leadMeta/save', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ data: data.data })
    //         });
    //     } catch (error) {
    //         console.error('Error fetching leads:', error);
    //     }
    //     finally {
    //         this.loading = false;
    //     }
    //   }
  },
});