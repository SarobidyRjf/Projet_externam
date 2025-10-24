<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useVModel } from "@vueuse/core";
import { cn } from "~/lib/utils";
import { Eye, EyeOff } from "lucide-vue-next";
const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes["class"];
}>();

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void;
}>();

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
});

const attrs = useAttrs();
const viewStatus = ref<string>((attrs.type as string) || "text");
function viewToggle() {
  if (viewStatus.value == "password") viewStatus.value = "text";
  else viewStatus.value = "password";
}
const hidden = computed(() => {
  if (viewStatus.value == "password") return true;
  else return false;
});
</script>

<template>
  <div class="relative w-full">
    <input
      v-bind="$attrs"
      v-model="modelValue"
      data-slot="input"
      :class="
        cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          props.class,
          $attrs.type == 'password' && 'pr-8'
        )
      "
      :type="viewStatus"
    />
    <template v-if="$attrs.type == 'password'">
      <span
        class="absolute cursor-pointer flex justify-center items-center end-0 inset-y-0 pr-1.5"
        @click="viewToggle"
      >
        <Button variant="ghost" class="!p-1 h-auto">
          <Eye v-if="hidden" class="size-4 text-muted-foreground" />
          <EyeOff v-else class="size-4 text-muted-foreground" />
        </Button>
      </span>
    </template>
  </div>
</template>
