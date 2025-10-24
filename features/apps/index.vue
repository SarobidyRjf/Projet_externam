<script setup lang="ts">
import { apps } from "./data/apps";
</script>
<template>
  <DashboardContent>
    <template #header>
      <div class="flex flex-col">
        <h2 class="text-2xl font-bold tracking-tight">App Integrations</h2>
        <span class="text-slate-500"
          >Here's a list of your apps for the integration!</span
        >
      </div>
    </template>

    <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="(app, index) in apps"
        :key="index"
        class="shadow-none hover:shadow-sm dark:shadow-slate-700 transition-all"
      >
        <CardHeader>
          <div class="w-full flex justify-between items-center">
            <Button size="icon" variant="secondary">
              <Icon :name="app.logo" :size="20" class="opacity-70" />
            </Button>
            <Button
              variant="outline"
              :class="[
                app.connected &&
                  'bg-blue-500/10  hover:bg-blue-500/20 border-blue-500/50 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:border-blue-500/50',
              ]"
              >{{ app.connected ? "connected" : "connect" }}</Button
            >
          </div>
        </CardHeader>
        <CardContent>
          <div class="w-full flex flex-col gap-1">
            <span class="font-semibold">{{ app.name }}</span>
            <span class="text-slate-500 line-clamp-2">{{ app.desc }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardContent>
</template>
