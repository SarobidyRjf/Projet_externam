<script setup lang="ts">
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
</script>
<template>
  <SidebarProvider>
    <DashboardSidebar />
    <SidebarInset class="w-auto">
      <DashboardHeader />

      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>
