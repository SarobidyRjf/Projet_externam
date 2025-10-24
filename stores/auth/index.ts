import { defineStore } from 'pinia';
import { createMongoAbility, type AnyMongoAbility } from '@casl/ability';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export const useAuthStore = defineStore('authStore', {
  state: () => ({
      user: null as any,
      userConnected: null as any,
      ability: null as AnyMongoAbility | null,
      loading: false,
  }),
    actions: {
        async authentification(email: string, password: string) {
            try {
                this.loading = true;
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                if (!res.ok) {
                    throw new Error('Failed to authenticate');
                }
                this.user = await res.json();
                const token = useCookie<string | null>('token');
                token.value = this.user.token;
                sessionStorage.setItem('justLoggedIn', 'true');
                navigateTo('/');
            } catch(err) {
                console.log(err)
                toast.error('Email ou mot de passe incorrect', {
                    position: 'top-right', 
                    theme: 'colored'
                });
            }
            finally {
                this.loading = false
            }
        },

         async getUserConnected() {
            try {
                const res = await fetch('/api/auth/me', {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!res.ok) {
                    throw new Error('Failed to get user');
                }
                const { user, abilities } = await res.json();
                this.userConnected = user;
                this.ability = createMongoAbility(abilities);
            } catch(err) {
                console.log(err)
            }
        },
         
         async logout() {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const token = useCookie<string | null>('token');
                token.value = null;
                this.userConnected = null;
                this.ability = null;
                navigateTo('/login');
            } catch(err) {
                console.log(err)
            }
         }
    }
});