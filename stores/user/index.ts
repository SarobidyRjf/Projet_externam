import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', {
    state: () => ({
        // --- Utilisateurs commerciaux ---
        user_commercial: [] as Array<any>,

        // --- Profil utilisateur connecté ---
        profile: null as any,
        loading: false,
        error: null as string | null,

        // --- Tous les utilisateurs ---
        users: [] as Array<any>,
    }),

    actions: {

        /** -----------------------------
         *  🔹 Récupération de tous les utilisateurs
         *  ----------------------------- */
        async getAllUsers() {
            this.loading = true
            this.error = null
            try {
                const res = await fetch('/api/user/all', {
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) throw new Error('Échec de récupération des utilisateurs')
                this.users = await res.json()
            } catch (err: any) {
                console.error(err)
                this.error = err.message
            } finally {
                this.loading = false
            }
        },

        /** -----------------------------
 *  🔹 Création d'un utilisateur
 *  ----------------------------- */
        async createUser(data: any) {
            this.loading = true
            this.error = null
            try {
                const res = await fetch('/api/user/all', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                })
                if (!res.ok) throw new Error('Erreur de création de l’utilisateur')
                await this.getAllUsers() // refresh liste
            } catch (e: any) {
                console.error(e)
                this.error = e.message
            } finally {
                this.loading = false
            }
        },

        /** -----------------------------
         *  🔹 Mise à jour d’un utilisateur
         *  ----------------------------- */
        async updateUser(userId: string, data: any) {
            this.loading = true
            this.error = null
            try {
                const res = await fetch('/api/user/all', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, ...data }),
                })
                if (!res.ok) throw new Error('Erreur de mise à jour de l’utilisateur')
                await this.getAllUsers() // refresh liste
            } catch (e: any) {
                console.error(e)
                this.error = e.message
            } finally {
                this.loading = false
            }
        },

        /** -----------------------------
         *  🔹 Suppression d’un utilisateur
         *  ----------------------------- */
        async deleteUser(userId: string) {
            if (!confirm('Supprimer cet utilisateur ?')) return
            this.loading = true
            this.error = null
            try {
                const res = await fetch('/api/user/all', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                })
                if (!res.ok) throw new Error('Erreur de suppression de l’utilisateur')
                await this.getAllUsers() // refresh liste
            } catch (e: any) {
                console.error(e)
                this.error = e.message
            } finally {
                this.loading = false
            }
        },

        /** -----------------------------
         *  🔹 Récupération des commerciaux
         *  ----------------------------- */
        async getCommercialUser() {
            this.loading = true
            this.error = null
            try {
                const res = await fetch('/api/user/commercial', {
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) throw new Error('Échec de récupération des commerciaux')
                this.user_commercial = await res.json()
            } catch (err: any) {
                console.error(err)
                this.error = err.message
            } finally {
                this.loading = false
            }
        },

        /** -----------------------------
         *  🔹 Récupération du profil utilisateur
         *  ----------------------------- */
        async getProfile() {
            this.loading = true
            this.error = null
            try {
                const res = await fetch('/api/user') // <-- ici, pas /get
                console.log('prodile', res);
                if (!res.ok) throw new Error('Erreur de récupération du profil')
                this.profile = await res.json()
            } catch (e: any) {
                console.error(e)
                this.error = e.message
            } finally {
                this.loading = false
            }
        },

        /** -----------------------------
         *  🔹 Mise à jour du profil
         *  ----------------------------- */
        async updateProfile(data: any) {
            this.loading = true
            this.error = null
            try {
                const res = await fetch('/api/user/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                })
                if (!res.ok) throw new Error('Erreur de mise à jour du profil')
                this.profile = await res.json()
            } catch (e: any) {
                console.error(e)
                this.error = e.message
            } finally {
                this.loading = false
            }
        },

        /** -----------------------------
         *  🔹 Suppression du profil
         *  ----------------------------- */
        async deleteProfile() {
            if (!confirm('Supprimer le profil ?')) return
            this.loading = true
            this.error = null
            try {
                const res = await fetch('/api/user/delete', { method: 'DELETE' })
                if (!res.ok) throw new Error('Erreur de suppression du profil')
                this.profile = null
            } catch (e: any) {
                console.error(e)
                this.error = e.message
            } finally {
                this.loading = false
            }
        },
    },
})
