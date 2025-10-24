<script setup lang="ts">
import type { SidebarGroup } from "~/constants/sidebar_links";
import { useMagicKeys } from "@vueuse/core";

import { Input } from "@/components/ui/input";

defineProps<{ pageLinks: SidebarGroup[] }>();
const open = defineModel<boolean>("open");

const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) e.preventDefault();
  },
});

function handleOpenChange() {
  open.value = !open.value;
}

watch([Meta_K, Ctrl_K], (v) => {
  if (v[0] || v[1]) handleOpenChange();
});
</script>
<template>
  <div class="w-full max-w-sm cursor-pointer overflow-hidden rounded-md">
    <div
      class="relative flex justify-between w-full items-center hover:bg-slate-500/5 transition-all"
      @click="handleOpenChange"
    >
      <span
        class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
      >
        <Icon name="hugeicons:search-01" class="size-5 text-muted-foreground" />
      </span>
      <Input
        id="search"
        type="text"
        placeholder="Rechercher..."
        class="px-8 pointer-events-none text-sm w-full"
      />

      <span
        class="absolute end-0 inset-y-0 flex items-center justify-center px-2"
      >
        <kbd
          class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
        >
          <span class="text-xs">⌘</span>K
        </kbd>
      </span>
    </div>
  </div>
  <CommandDialog v-model:open="open">
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup
        v-for="({ label, links }, index) in pageLinks"
        :key="label"
        :heading="label"
      >
        <div v-for="item in links" :key="item.title">
          <template v-if="item.items">
            <NuxtLink
              v-for="subItem in item.items"
              :key="subItem.title"
              :to="subItem.url"
              @click="open = false"
            >
              <CommandItem class="cursor-pointer" :value="subItem.title">
                {{ subItem.title }}
              </CommandItem>
            </NuxtLink>
          </template>

          <template v-else>
            <NuxtLink :to="item.url" @click="open = false">
              <CommandItem class="cursor-pointer" :value="item.title">
                {{ item.title }}
              </CommandItem>
            </NuxtLink>
          </template>
        </div>
        <CommandSeparator v-if="index + 1 < pageLinks.length" class="mt-1" />
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>
