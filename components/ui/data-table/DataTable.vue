<script setup lang="ts">
import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";

import {
  FlexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { valueUpdater } from "~/lib/utils";
import DataTablePagination from "../../../features/tasks/components/DataTablePagination.vue";

// Interface générique pour les colonnes
export interface ColumnDefProps {
  id?: string;
  accessorKey?: string;
  header?: string | Function;
  cell?: Function;
  meta?: { 
    title?: string;
    [key: string]: any;
  };
  enableSorting?: boolean;
  enableRowSelection?: boolean;
  enableAllPageRowsSelected?: boolean;
  [key: string]: any;
  showIf?: (role: string) => boolean; 
}

// Props génériques - accepte n'importe quel type de données
const props = defineProps<{
  columns: ColumnDefProps[];
  data: Record<string, any>[]; // Ou any[] pour plus de flexibilité
}>();

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});

const table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  getRowId: (row) => row._id,
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
  },
  enableRowSelection: true,
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, rowSelection),
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
});

defineExpose({
  table
});

const emit = defineEmits<{
  (e: "row-click", row: Record<string, any>): void;
}>();

</script>

<template>
  <div class="space-y-4">
    <slot name="toolbar" v-bind="{ table }" />

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <!-- Checkbox de seleção de todas as linhas -->
              <template
                v-if="header.column.columnDef.enableAllPageRowsSelected"
              >
                <Checkbox
                  :model-value="
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                  "
                  aria-label="Select all"
                  class="translate-y-0.5 mx-1"
                  @update:model-value="
                    (value) => table.toggleAllPageRowsSelected(!!value)
                  "
                />
              </template>

              <!-- Header com ordenação -->
              <template
                v-else-if="
                  !header.isPlaceholder && header.column.columnDef.enableSorting
                "
              >
                <div class="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button
                        variant="ghost"
                        size="sm"
                        class="-ml-3 h-8 data-[state=open]:bg-accent"
                      >
                        <span>{{ header.column.columnDef.meta?.title || header.column.columnDef.header }}</span>
                        <Icon
                          v-if="header.column.getIsSorted() === 'desc'"
                          name="hugeicons:arrow-down-01"
                          class="ml-2 h-4 w-4"
                        />
                        <Icon
                          v-else-if="header.column.getIsSorted() === 'asc'"
                          name="hugeicons:arrow-up-01"
                          class="ml-2 h-4 w-4"
                        />
                        <Icon
                          v-else
                          name="radix-icons:caret-sort"
                          class="ml-2 h-4 w-4"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        @click="header.column.toggleSorting(false)"
                      >
                        <Icon
                          name="hugeicons:arrow-up-01"
                          class="mr-2 h-3.5 w-3.5 text-muted-foreground/70"
                        />
                        Asc
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        @click="header.column.toggleSorting(true)"
                      >
                        <Icon
                          name="hugeicons:arrow-down-01"
                          class="mr-2 h-3.5 w-3.5 text-muted-foreground/70"
                        />
                        Desc
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </template>

              <!-- Header customizado (fallback) -->
              <template v-else-if="!header.isPlaceholder">
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </template>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() && 'selected'"
              @click="emit('row-click', row.original)"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" class="py-4">
                <!-- Checkbox por linha -->
                <template v-if="cell.column.columnDef.enableRowSelection">
                  <Checkbox
                    :model-value="row.getIsSelected()"
                    aria-label="Select row"
                    class="translate-y-0.5 mx-1"
                    @update:model-value="(value) => row.toggleSelected(!!value)"
                  />
                </template>

                <!-- Slot customizado -->
                <template v-else>
                  <slot
                    :name="`${cell.column.id}-data`"
                    v-bind="{ row: row.original, cell }"
                  >
                    <FlexRender
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </slot>
                </template>
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-else>
            <slot name="empty">
              <TableCell
                :colspan="props.columns.length"
                class="h-24 text-center"
              >
                No results.
              </TableCell>
            </slot>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <DataTablePagination :table="table" />
  </div>
</template>