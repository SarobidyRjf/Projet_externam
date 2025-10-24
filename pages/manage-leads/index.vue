<template>
  <Leads />
</template>

<script setup>
import Leads from '@/features/leads/index.vue';

definePageMeta({
  middleware: "auth",
});
</script>

<style lang="scss" scoped>

</style>