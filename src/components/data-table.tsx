import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
  Updater,
  Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {ChevronDown} from "lucide-react";

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  // If provided, table works in manual pagination mode
  pageCount?: number
  // Initial state such as pagination
  initialPageIndex?: number
  initialPageSize?: number
  // Optional handlers for server-driven mode
  onPaginationChange?: (state: PaginationState) => void
  onSortingChange?: (state: SortingState) => void
  onGlobalFilterChange?: (value: string) => void
  // Provide a way to customize row actions rendering from parent if needed
  renderRowActions?: (row: Row<TData>) => React.ReactNode
  // Render custom actions for currently selected rows (e.g., bulk delete)
  renderSelectedActions?: (opts: {
    selectedRows: Row<TData>[]
    selectedRowIds: string[]
    clearSelection: () => void
  }) => React.ReactNode
  getRowId?: (originalRow: TData, index: number) => string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  initialPageIndex = 0,
  initialPageSize = 10,
  onPaginationChange,
  onSortingChange,
  onGlobalFilterChange,
  renderRowActions,
  renderSelectedActions,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const manualPagination = typeof pageCount === "number"

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      setSorting(next)
      onSortingChange?.(next)
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: (val: Updater<string>) => {
      const next = typeof val === "function" ? (val as any)(globalFilter) : val
      setGlobalFilter(next as string)
      onGlobalFilterChange?.(String(next ?? ""))
    },
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const next = typeof updater === "function" ? (updater as any)(pagination) : updater
      setPagination(next)
      onPaginationChange?.(next)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    getRowId: getRowId as any,
  })

  const canPreviousPage = manualPagination ? pagination.pageIndex > 0 : table.getCanPreviousPage()
  const canNextPage = manualPagination
    ? typeof pageCount === "number" && pagination.pageIndex < pageCount - 1
    : table.getCanNextPage()

  const selectedRows = table.getSelectedRowModel().rows
  const selectedRowIds = selectedRows.map((r) => String(r.id))

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="w-[240px]"
          />
        </div>
        {/* Column visibility toggles */}
	      <DropdownMenu>
		      <DropdownMenuTrigger asChild>
			      <Button variant="outline" className="ml-auto">
				      Columns <ChevronDown />
			      </Button>
		      </DropdownMenuTrigger>
		      <DropdownMenuContent align="end">
			      {table
			      .getAllColumns()
			      .filter((column) => column.getCanHide())
			      .map((column) => {
				      return (
					      <DropdownMenuCheckboxItem
						      key={column.id}
						      className="capitalize"
						      checked={column.getIsVisible()}
						      onCheckedChange={(value) =>
							      column.toggleVisibility(value)
						      }
					      >
						      {column.id}
					      </DropdownMenuCheckboxItem>
				      )
			      })}
		      </DropdownMenuContent>
	      </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="select-none">
                      {header.isPlaceholder ? null : (
                        <div
                          className={header.column.getCanSort() ? "cursor-pointer" : undefined}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === "asc" ? " \u2191" : header.column.getIsSorted() === "desc" ? " \u2193" : null}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  {renderRowActions ? <TableCell>{renderRowActions(row as Row<TData>)}</TableCell> : null}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} of {table.getFilteredRowModel().rows.length} row(s) selected
          </div>
          {renderSelectedActions && selectedRows.length > 0 ? (
            <div className="flex items-center gap-2">
              {renderSelectedActions({
                selectedRows: selectedRows as any,
                selectedRowIds,
                clearSelection: () => table.resetRowSelection(),
              })}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(val) => table.setPageSize(Number(val))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => table.firstPage()} disabled={!canPreviousPage}>
              First
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!canPreviousPage}>
              Previous
            </Button>
            <span className="px-2 text-sm">
              Page {pagination.pageIndex + 1}
              {manualPagination && typeof pageCount === "number" ? ` / ${pageCount}` : ""}
            </span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!canNextPage}>
              Next
            </Button>
            {manualPagination && typeof pageCount === "number" ? (
              <Button variant="outline" size="sm" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!canNextPage}>
                Last
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataTable
