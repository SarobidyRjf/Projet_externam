import { number } from 'zod';
import { get } from "lodash";
import { useLeadHistory } from '~/stores/leads/history';

interface RdvDetailed {
    date_rdv_rappel: string | null,
    reminders?: number[],
    reminder?: number,
    checklist: Array<any>,
    etiquette: Array<any>,
    membres: Array<any>,
    niveau_prospect: number,
    piece_jointe?: {
        docs_societe?: Record<string, string>,
        contrat?: string[],
        facture?: string[],
        autre?: string[]
    }
}

export const useDetailedRdv = defineStore('detailedRdv', {
    state: () => ({
        rdvDetailed: null as RdvDetailed | null,
        loading : false
    }),
    actions: {
        async getDetailedRdv(idLead: string) {
            try {
                const response = await $fetch(`/api/leadMeta/manage/rdv/${idLead}/detailrdv`)
                
                this.rdvDetailed = response ?? null
            } catch (err) { 
                console.log(err)
            }
        },

        async addDateRappel(idLead: string, date_rdv_rappel: string | Date, reminders: number[]) {
            try {
                this.loading = true
                await $fetch(`/api/leadMeta/manage/rdv/${idLead}/date`, {
                    method: 'POST',
                    body: {
                        date_rdv_rappel: date_rdv_rappel instanceof Date ? date_rdv_rappel.toISOString() : date_rdv_rappel,
                        reminders
                    }

                })
                const history = useLeadHistory()
                await history.addHistory(idLead, 'a modifié la date de rappel', ['date_rdv_rappel', 'reminders'])
            } catch (err) {
                console.log(err)
            } finally {
                this.loading = false
            }
        },

        async addChecklist(idLead: string, title: string) {
            try {
                this.loading = true
                await $fetch(`/api/leadMeta/manage/rdv/${idLead}/checklist`, {
                    method: 'POST',
                    body: {
                        title
                    }
                })
                const history = useLeadHistory()
                await history.addHistory(idLead, 'a ajouté une checklist', ['checklist'])
                // await this.getDetailedRdv(idLead)
            } catch (err) {
                console.log(err)
            } finally {
                this.loading = false
            }
        },

        async addItemChecklist(idLead: string, indexChecklist: number, label: string) {
            try {
                this.loading = true
                await $fetch(`/api/leadMeta/manage/rdv/${idLead}/checklist/${indexChecklist}`, {
                    method: 'POST',
                    body: {
                        indexChecklist,
                        label
                    }
                })
                const history = useLeadHistory()
                await history.addHistory(idLead, 'a ajouté un élément de checklist', ['checklist.items'])
            } catch (err) {
                console.log(err)
            } finally {
                this.loading = false
            }
        },

        async toggleItemChecklist(idLead: string, checklistIndex: number, itemIndex: number) {
            try {
                this.loading = true
                await $fetch(`/api/leadMeta/manage/rdv/${idLead}/checklist/toggle?checklistIndex=${checklistIndex}&itemIndex=${itemIndex}`, {
                    method: 'PATCH'
                })
                await this.getDetailedRdv(idLead)
                const history = useLeadHistory()
                await history.addHistory(idLead, 'a modifié un élément de checklist', ['checklist.items'])
            } catch (err) {
                console.log(err)
            } finally {
                this.loading = false
            }
        },

        async deleteChecklist(idLead: string, checklistIndex: number) {
            try {
                this.loading = true
                await $fetch(`/api/leadMeta/manage/rdv/${idLead}/checklist/${checklistIndex}`, {
                    method: 'DELETE'
                })
                await this.getDetailedRdv(idLead)
                const history = useLeadHistory()
                await history.addHistory(idLead, 'a supprimé une checklist', ['checklist'])
            } catch (err) {
                console.log(err)
            } finally {
                this.loading = false
            }
        },

        async deleteItemChecklist(idLead: string, checklistIndex: number, itemIndex: number) {
            try {
                this.loading = true
                await $fetch(`/api/leadMeta/manage/rdv/${idLead}/checklist/item?checklistIndex=${checklistIndex}&itemIndex=${itemIndex}`, {
                    method: 'DELETE'
                })
                await this.getDetailedRdv(idLead)
                const history = useLeadHistory()
                await history.addHistory(idLead, 'a supprimé un élément de checklist', ['checklist.items'])
            } catch (err) {
                console.log(err)
            } finally {
                this.loading = false
            }
        },

        async addLevelProspect(idLead: string, niveau_prospect: number) {
            try {
                this.loading = true
                await $fetch(`/api/leadMeta/manage/rdv/${idLead}/prospectLevel`, {
                    method: 'POST',
                    body: {
                        niveau_prospect
                    }
                })
                await this.getDetailedRdv(idLead)
                const history = useLeadHistory()
                await history.addHistory(idLead, 'a modifié le niveau prospect', ['niveau_prospect'])
            } catch (err) {
                console.log(err)
            } finally {
                this.loading = false
            }
        },

        async updateMembres(idLead: string, membres: string[]) {
            try {
                this.loading = true
                await $fetch(`/api/leadMeta/manage/rdv/${idLead}/membres`, {
                    method: 'POST',
                    body: {
                        membres
                    }
                })
                await this.getDetailedRdv(idLead)
                const history = useLeadHistory()
                await history.addHistory(idLead, 'a mis à jour les membres', ['membres'])
            } catch (err) {
                console.log(err)
            } finally {
                this.loading = false
            }
        },

        async uploadPieceJointe(idLead: string, file: File, category: string, docType?: string) {
            try {
                this.loading = true
                const formData = new FormData()
                formData.append('file', file)
                const query = new URLSearchParams({ category })
                if (docType) query.append('docType', docType)
                await $fetch(`/api/leadMeta/manage/rdv/${idLead}/pieceJointe?${query.toString()}`, {
                    method: 'POST',
                    body: formData
                })
                await this.getDetailedRdv(idLead)
                const history = useLeadHistory()
                await history.addHistory(idLead, 'a ajouté une pièce jointe', ['piece_jointe'])
            } catch (err) {
                console.log(err)
            } finally {
                this.loading = false
            }
        },

        async deletePieceJointe(idLead: string, category: string, key?: string | number) {
            try {
                this.loading = true
                const params = new URLSearchParams({ category })
                if (key !== undefined) {
                    if (category === 'docs_societe') params.append('docType', String(key))
                    else params.append('index', String(key))
                }
                await $fetch(`/api/leadMeta/manage/rdv/${idLead}/pieceJointe?${params.toString()}`, {
                    method: 'DELETE'
                })
                await this.getDetailedRdv(idLead)
                const history = useLeadHistory()
                await history.addHistory(idLead, 'a supprimé une pièce jointe', ['piece_jointe'])
            } catch (err) {
                console.log(err)
            } finally {
                this.loading = false
            }
        }
    },
})