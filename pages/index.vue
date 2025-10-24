<script setup lang="ts">
import Dashboard from "@/features/dashboard/index.vue";
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from "pinia";
import "vue3-toastify/dist/index.css";
import { toast } from "vue3-toastify";

const { getUserConnected } = useAuthStore();
const { userConnected } = storeToRefs(useAuthStore());

definePageMeta({
  middleware: "auth",
});

onMounted(async() => {
  await getUserConnected();
  const justLoggedIn = sessionStorage.getItem('justLoggedIn');

  if(justLoggedIn === 'true' && userConnected.value){
    setTimeout(() => {
      toast.success(`Bienvenue ${userConnected.value.nom + " " + userConnected.value.prenom}`, {
        position: "top-center",
        hideProgressBar: false,
        theme: "light",
        transition: "zoom",
      });
    }, 1000);
    sessionStorage.removeItem('justLoggedIn');
  }
}
);

</script>

<template>
  <Dashboard />
</template>
