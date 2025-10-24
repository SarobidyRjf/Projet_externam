<script setup lang="ts">
import { cn } from "~/lib/utils";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>
<template>
  <div
    :class="cn(' grid grid-cols-1  space-y-4 w-auto  p-4 pt-6', props.class)"
    v-bind="$attrs"
  >
    <slot name="header" />
    <slot />
  </div>
</template>
