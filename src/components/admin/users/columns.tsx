"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { TUser } from "@/actions/users/validations"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { deleteUser, updateUser } from "@/actions/users/actions"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import {Role} from "@prisma/client";

export const userColumns: ColumnDef<TUser>[] = [
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
      const val = row.getValue<string>("name")
      return <span className="font-medium">{val}</span>
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
	  cell: ({ row }) => {
		  const [isPending, startTransition] = React.useTransition()

		  const handleChange = (role: Role) => {
			  startTransition(async () => {
				  try {
					  const res = await updateUser(row.original.id, {
							role: role
					  })
					  if (res.error) {
						  console.log(res.error)
						  toast.error(JSON.stringify(res.error))
						  return
					  }
					  toast.success("User updated successfully")
				  } catch (err: any) {
					  console.log(err)
					  toast.error(JSON.stringify(err))
				  }
			  })
		  }

		  return (
			  <>
				  <Select value={row.original.role || Role.USER} onValueChange={handleChange} disabled={isPending}>
					  <SelectTrigger className="w-[180px]">
						  <SelectValue placeholder="Select role" />
					  </SelectTrigger>
					  <SelectContent>
						  <SelectGroup>
							  <SelectLabel>Role</SelectLabel>
							  {Object.keys(Role).map((r) => (
								  <SelectItem key={r} value={r}>{r}</SelectItem>
							  ))}
						  </SelectGroup>
					  </SelectContent>
				  </Select>
			  </>
		  )
	  },
  },
  {
    accessorKey: "emailVerified",
    header: "Verified",
    cell: ({ row }) => {
      const val = row.getValue<boolean>("emailVerified")
      const [isPending, startTransition] = React.useTransition()

      const handleChange = () => {
        startTransition(async () => {
          try {
            const res = await updateUser(row.original.id, {
              emailVerified: !val,
            })
            if (res.error) {
              console.log(res.error)
              toast.error(JSON.stringify(res.error))
              return
            }
            toast.success("User updated successfully")
          } catch (err: any) {
            console.log(err)
            toast.error(JSON.stringify(err))
          }
        })
      }

      return (
        <>
          <Checkbox checked={val} onCheckedChange={() => handleChange()} />
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
      const user = row.original
      const [isPending, startTransition] = React.useTransition()

      const handleDelete = () => {
        if (!confirm(`Are you sure you want to delete "${user.name}"?`)) return
        startTransition(async () => {
          try {
            const res = await deleteUser(user.id)
            if (res.error) {
              console.log(res.error)
              toast.error(JSON.stringify(res.error))
              return
            }
            toast.success("User deleted successfully")
          } catch (err: any) {
            console.log(err)
            toast.error(JSON.stringify(err))
          }
        })
      }

      return (
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/users/${user.id}`}>Edit</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      )
    },
  },
]
