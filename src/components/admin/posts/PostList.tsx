"use client";

import React from "react";
import { TPost } from "@/actions/posts/validations";
import { DataTable } from "@/components/data-table";
import { postColumns } from "./columns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { deletePosts } from "@/actions/posts/actions";
import { toast } from "sonner";

export default function PostList(props: {
  data: TPost[];
  curPage: number;
  perPage: number;
  pageCount: number;
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const setQuery = (updates: Record<string, string | number | undefined | null>) => {
    const sp = new URLSearchParams(searchParams?.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === null || v === "") sp.delete(k);
      else sp.set(k, String(v));
    }
    router.push(`${pathname}?${sp.toString()}`);
  };

  const handlePaginationChange = (state: PaginationState) => {
    setQuery({ page: state.pageIndex + 1, per_page: state.pageSize });
  };

  const handleSortingChange = (state: SortingState) => {
    const first = state[0];
    if (!first) {
      setQuery({ sort: null });
      return;
    }
    const sort = `${first.id}.${first.desc ? "desc" : "asc"}`;
    setQuery({ sort, page: 1 });
  };

  const handleGlobalFilterChange = (val: string) => {
    setQuery({ search: val, page: 1 });
  };

  return (
    <div className="mt-4">
      <DataTable<TPost, unknown>
        columns={postColumns}
        data={props.data}
        pageCount={props.pageCount}
        initialPageIndex={(props.curPage ?? 1) - 1}
        initialPageSize={props.perPage ?? 10}
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        onGlobalFilterChange={handleGlobalFilterChange}
        renderSelectedActions={({ selectedRowIds, clearSelection }) => {
          const count = selectedRowIds.length
          return (
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending || count === 0}
              onClick={() => {
                if (count === 0) return
                if (!confirm(`Are you sure you want to delete ${count} selected post(s)?`)) return
                startTransition(async () => {
                  try {
                    const res = await deletePosts(selectedRowIds as string[])
                    if ((res as any)?.error) {
                      console.log((res as any).error)
                      toast.error(JSON.stringify((res as any).error))
                      return
                    }
                    toast.success(`Deleted ${count} post(s) successfully`)
                    clearSelection()
                  } catch (err: any) {
                    console.log(err)
                    toast.error(JSON.stringify(err))
                  }
                })
              }}
            >
              {isPending ? "Deleting..." : `Delete selected (${count})`}
            </Button>
          )
        }}
        getRowId={(row) => (row as any).id}
      />
    </div>
  );
}
