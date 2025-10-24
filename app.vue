<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
// onMounted(async() => {
//   await auth.getUserConnected();
// });

const { state } = useColorMode();

const loadingColor = computed(() =>
  state.value === "light" ? "#6B7280" : "#D1D5DB"
);
</script>

<template>
  <ClientOnly>
    <NuxtLoadingIndicator :color="loadingColor" />
  </ClientOnly>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
