<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import { Sun, Moon, Check } from "lucide-vue-next";

const mode = useColorMode();
</script>
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        <Sun
          class="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Moon
          class="w-4 h-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />

        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="mode = 'light'">
        <div class="w-full flex items-center justify-between">
          <span> Clair </span>
          <Check v-if="mode == 'light'" class="size-4" />
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'dark'">
        <div class="w-full flex items-center justify-between">
          <span> Sombre </span>
          <Check v-if="mode == 'dark'" class="size-4" />
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'auto'">
        <div class="w-full flex items-center justify-between">
          <span> Système </span>
          <Check v-if="mode == 'auto'" class="size-4" />
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
