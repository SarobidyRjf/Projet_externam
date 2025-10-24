<script setup lang="ts">
import { columns } from "./components/columns";
import tasks from "./data/tasks.json";

import DataTableRowActions from "./components/DataTableRowActions.vue";
import { priorities, statuses } from "./data/data";

function getStatusData(
  datas: { value: string; label: string; icon: string }[],
  type: string
) {
  return datas.filter(
    (data) =>
      data.value === type && {
        label: data.label,
        value: data.value,
        icon: data.icon,
      }
  );
}
</script>
<template>
  <DashboardContent>
    <template #header>
      <div class="flex flex-col">
        <h2 class="text-2xl font-bold tracking-tight">Welcome back!</h2>
        <p class="text-muted-foreground">
          Here's a list of your tasks for this month!
        </p>
      </div>
    </template>

    <div class="w-full space-y-4">
      <DataTable :data="tasks" :columns="columns">
        <template #toolbar="{ table }">
          <DataTableToolbar :table="table" />
        </template>

        <template #id-data="{ row }">
          <span>{{ row.id }}</span>
        </template>

        <template #title-data="{ row }">
          <div class="flex items-center space-x-2">
            <Badge variant="outline"> {{ row.label }} </Badge>
            <span>{{ row.title }}</span>
          </div>
        </template>

        <template #status-data="{ row }">
          <div class="flex items-center gap-2">
            <Icon
              v-if="getStatusData(statuses, row.status)[0].icon"
              :name="getStatusData(statuses, row.status)[0].icon"
              class="h-4 w-4 text-muted-foreground"
            />
            {{ row.status }}
          </div>
        </template>

        <template #priority-data="{ row }">
          <div class="flex items-center gap-2">
            <Icon
              v-if="getStatusData(priorities, row.priority)[0].icon"
              :name="getStatusData(priorities, row.priority)[0].icon"
              class="h-4 w-4 text-muted-foreground"
            />
            {{ row.priority }}
          </div>
        </template>

        <template #actions-data="{ row }">
          <DataTableRowActions :row="row" />
        </template>
      </DataTable>
    </div>
  </DashboardContent>
</template>
