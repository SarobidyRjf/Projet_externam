<script setup lang="ts">
import type { Table } from "@tanstack/vue-table";
import { computed } from "vue";

import { priorities, statuses } from "~/features/tasks/data/data";
import DataTableFacetedFilter from "./DataTableFacetedFilter.vue";
import type { Task } from "~/features/tasks/data/schema";

interface DataTableToolbarProps {
  table: Table<Task>;
}

const props = defineProps<DataTableToolbarProps>();

const isFiltered = computed(
  () => props.table.getState().columnFilters.length > 0
);
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-1 items-center space-x-2">
      <div class="w-[150px] lg:w-[250px]">
        <Input
          placeholder="Filter tasks..."
          :model-value="(table.getColumn('title')?.getFilterValue() as string) ?? ''"
          class="h-8"
          @input="table.getColumn('title')?.setFilterValue($event.target.value)"
        />
      </div>

      <DataTableFacetedFilter
        v-if="table.getColumn('status')"
        :column="table.getColumn('status')"
        title="Status"
        :options="statuses"
      />
      <DataTableFacetedFilter
        v-if="table.getColumn('priority')"
        :column="table.getColumn('priority')"
        title="Priority"
        :options="priorities"
      />

      <Button
        v-if="isFiltered"
        variant="ghost"
        class="h-8 px-2 lg:px-3"
        @click="table.resetColumnFilters()"
      >
        Reset
        <Icon name="tabler:x" class="ml-2 h-4 w-4" />
      </Button>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" size="sm" class="ml-auto hidden h-8 lg:flex">
          <Icon name="radix-icons:mixer-horizontal" class="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          v-for="column in table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanHide()
            )"
          :key="column.id"
          class="capitalize"
          :model-value="column.getIsVisible()"
          @update:model-value="(value) => column.toggleVisibility(!!value)"
        >
          {{ column.id }}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
