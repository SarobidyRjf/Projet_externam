<script setup lang="ts">
definePageMeta({
  alias: "/503",
  layout: false,
});
</script>

<template>
  <div class="h-svh">
    <div
      class="m-auto px-4 flex h-full w-full flex-col items-center justify-center gap-2"
    >
      <h1 class="text-[7rem] leading-tight font-bold">503</h1>
      <span class="font-medium">Website is under maintenance! </span>
      <p class="text-muted-foreground text-center flex flex-col">
        <span>The site is not available at the moment. </span>
        <span> We'll be back online shortly. </span>
      </p>
      <div class="mt-6">
        <Button variant="outline"> Learn more</Button>
      </div>
    </div>
  </div>
</template>
