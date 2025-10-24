import type { ColumnDef } from "@tanstack/vue-table";
import type { Task } from "../data/schema";

export type ColumnDefProps = ColumnDef<Task> & {
  enableAllPageRowsSelected?: boolean;
  enableRowSelection?: boolean;
};

export const columns: ColumnDefProps[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    enableAllPageRowsSelected: true,
    enableRowSelection: true,
  },
  {
    accessorKey: "id",
    meta: { title: "ID" },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    meta: { title: "Title" },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    meta: { title: "Status" },
    enableSorting: true,
  },
  {
    accessorKey: "priority",
    meta: { title: "Priority" },
    enableSorting: true,
  },
  {
    id: "actions",
  },
];
