"use client";

import React from "react";
import { TMedia } from "@/actions/media/validations";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MediaBrowser from "@/src/media-management/MediaBrowser";
import { useMediaSelectionStore } from "@/src/media-management/store";

export default function MediaManagement(props: {
  data: TMedia[];
  curPage: number;
  perPage: number;
  pageCount: number;
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { clear } = useMediaSelectionStore();

  // Clear selection on data change (page/search/sort changes)
  React.useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.curPage, props.perPage, props.pageCount, props.totalCount]);

  const setQuery = (updates: Record<string, string | number | undefined | null>) => {
    const sp = new URLSearchParams(searchParams?.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === null || v === "") sp.delete(k);
      else sp.set(k, String(v));
    }
    router.push(`${pathname}?${sp.toString()}`);
  };

  // Build filters from URL/searchParams + server-provided defaults
  const filters = {
    search: (searchParams?.get("search") ?? ""),
    sort: searchParams?.get("sort") ?? "createdAt.desc",
    page: Number(searchParams?.get("page") ?? props.curPage ?? 1),
    perPage: Number(searchParams?.get("per_page") ?? props.perPage ?? 12),
  };

  const setFilters = (updates: Partial<typeof filters>) => {
    const next: Record<string, string | number | undefined | null> = {};
    if (updates.search !== undefined) next["search"] = updates.search;
    if (updates.sort !== undefined) next["sort"] = updates.sort;
    if (updates.page !== undefined) next["page"] = updates.page;
    if (updates.perPage !== undefined) next["per_page"] = updates.perPage;
    setQuery(next);
  };

  return (
    <div className="mt-4">
      <MediaBrowser
        filters={filters}
        setFilters={setFilters}
        items={props.data}
        totalCount={props.totalCount}
        pageCount={props.pageCount}
        curPage={props.curPage}
        onAfterMutation={() => router.refresh()}
      />
    </div>
  );
}
