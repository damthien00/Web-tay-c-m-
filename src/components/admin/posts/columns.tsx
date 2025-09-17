"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { TPost } from "@/actions/posts/validations"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {deletePost, updatePost} from "@/actions/posts/actions"
import { toast } from "sonner"
import {Checkbox} from "@/components/ui/checkbox";

export const postColumns: ColumnDef<TPost>[] = [
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
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue<string>("title")
      return <span className="font-medium">{title}</span>
    },
  },
  {
    accessorKey: "published",
    header: "Published",
    cell: ({ row }) => {
      const val = row.getValue<boolean>("published")
	    const [isPending, startTransition] = React.useTransition()

	    const handleChange = () => {
		    startTransition(async () => {
			    try {
				    const res = await updatePost(row.original.id, {
							published: !val
				    })
				    if (res.error) {
					    console.log(res.error)
					    toast.error(JSON.stringify(res.error))
					    return
				    }
				    toast.success("Post updated successfully")
			    } catch (err: any) {
				    console.log(err)
				    toast.error(JSON.stringify(err))
			    }
		    })
	    }

      return (
				<>
					<Checkbox checked={val} onCheckedChange={(e) => handleChange()} />
				</>
      )
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
      const post = row.original
      const [isPending, startTransition] = React.useTransition()

      const handleDelete = () => {
        if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return
        startTransition(async () => {
          try {
            const res = await deletePost(post.id)
            if (res.error) {
              console.log(res.error)
              toast.error(JSON.stringify(res.error))
              return
            }
            toast.success("Post deleted successfully")
          } catch (err: any) {
            console.log(err)
            toast.error(JSON.stringify(err))
          }
        })
      }

      return (
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/posts/${post.id}`}>Edit</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      )
    },
  },
]
