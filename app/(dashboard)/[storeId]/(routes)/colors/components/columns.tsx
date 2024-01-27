"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type ColorColumn = {
  id: string
  name: string;
  value: string;
  createdAt: string;
}

export const columns: ColumnDef<ColorColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => (
      <div
        className = "flex items-center gap-x-2"
      >
        {row.original.value}
        <div 
          className = "h-6 w-6 rounded-full border"
          style = {{ backgroundColor: row.original.value }}
        />
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ( { row } ) => <CellAction 
      data = { row.original }
    />
  },
];

/*"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type BillboardColumn = {
  id: string;
  label: string;
  //status: string //"pending" | "processing" | "success" | "failed"
  //email: string
  createdAt: string;
}

export const columns: ColumnDef<BillboardColumn>[] = [
  /*{
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "label",
    header: "Label",
    /*header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },},
  {
    accessorKey: "createdAt",
    header: "Date",
  },
]
*/