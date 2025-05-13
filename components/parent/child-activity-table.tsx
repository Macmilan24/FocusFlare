/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel, // For sorting
  SortingState, // For sorting
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProgressItemSummary } from "@/actions/progress.actions"; // Your data type
import {
  ArrowUpDown,
  CheckCircle2,
  Circle,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns"; // For specific date formatting
import { Badge } from "@/components/ui/badge"; // For status display
import { ContentType } from "@prisma/client";

// Define columns for the table
export const columns: ColumnDef<ProgressItemSummary>[] = [
  {
    accessorKey: "lastAccessed",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-2"
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      format(new Date(row.getValue("lastAccessed")), "MMM d, yyyy HH:mm"),
  },
  {
    accessorKey: "contentTitle",
    header: "Activity",
    cell: ({ row }) => {
      const item = row.original;
      const Icon =
        item.contentType === ContentType.STORY ? BookOpen : HelpCircle;
      return (
        <div className="flex items-center">
          <Icon
            className={`mr-2 h-4 w-4 ${
              item.contentType === ContentType.STORY
                ? "text-blue-500"
                : "text-purple-500"
            }`}
          />
          <span className="font-medium">{item.contentTitle}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let variant:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success"
        | "warning" = "secondary";
      if (status === "completed" || status === "passed") variant = "success";
      if (status === "failed") variant = "destructive";
      if (status === "inprogress") variant = "warning";
      return (
        <Badge variant={variant as any} className="capitalize">
          {status}
        </Badge>
      ); // Cast variant if custom
    },
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-2 text-right w-full justify-end" // Align right
      >
        Score
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const score = row.getValue("score") as number | null;
      return (
        <div className="text-right font-medium">
          {score !== null ? `${score}%` : "N/A"}
        </div>
      );
    },
  },
];

interface ChildActivityTableProps {
  data: ProgressItemSummary[];
}

export function ChildActivityTable({ data }: ChildActivityTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // Enable sorting
    onSortingChange: setSorting, // Handle sorting state
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No activity results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
