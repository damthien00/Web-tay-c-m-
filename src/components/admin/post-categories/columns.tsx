"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"
import {Checkbox} from "@/components/ui/checkbox";
import {TPostCategory} from "@/actions/post-categories/validations";
import {deletePostCategory} from "@/actions/post-categories/actions";

export const postCategoryColumns: ColumnDef<TPostCategory>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(e) => table.toggleAllPageRowsSelected(!!e)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={row.getToggleSelectedHandler()}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue<string>("name")
      return <span className="font-medium">{name}</span>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const val = row.getValue<Date>("createdAt") as any
      const d = val instanceof Date ? val : new Date(val)
      return <span>{isNaN(d.getTime()) ? "-" : d.toLocaleString()}</span>
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original
      const [isPending, startTransition] = React.useTransition()

      const handleDelete = () => {
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return
        startTransition(async () => {
          try {
            const res = await deletePostCategory(item.id)
            if (res.error) {
              console.log(res.error)
              toast.error(JSON.stringify(res.error))
              return
            }
            toast.success("Post Category deleted successfully")
          } catch (err: any) {
            console.log(err)
            toast.error(JSON.stringify(err))
          }
        })
      }

      return (
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/post-categories/${item.id}`}>Edit</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      )
    },
  },
]
