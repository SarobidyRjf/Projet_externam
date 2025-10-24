<script setup lang="ts">
definePageMeta({
  alias: "/500",
  layout: false,
});
const router = useRouter();
</script>

<template>
  <div class="h-svh">
    <div
      class="m-auto px-4 flex h-full w-full flex-col items-center justify-center gap-2"
    >
      <h1 class="text-[7rem] leading-tight font-bold">500</h1>
      <span class="font-medium">Oops! Something went wrong :')</span>
      <p class="text-muted-foreground text-center flex flex-col">
        <span> Oops! Something went wrong :')</span>
        <span> Please try again later.</span>
      </p>
      <div class="mt-6 flex gap-4">
        <Button variant="outline" @click="router.go(-1)"> Go Back </Button>
        <Button @click="router.push('/')">Back to Home</Button>
      </div>
    </div>
  </div>
</template>
