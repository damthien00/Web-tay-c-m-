"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MediaBrowser from "@/media-management/MediaBrowser";
import type { TMedia } from "@/actions/media/validations";
import { useMediaStore, useMediaSelectionStore } from "@/media-management/store";

export default function MediaManagerModal(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onInsert?: (items: TMedia[]) => void;
}) {
  const { open, onOpenChange, onInsert } = props;
  const { filters, setFilters, fetch, result, loading } = useMediaStore();
  const { clear } = useMediaSelectionStore();

  // Fetch on open or filter change
  React.useEffect(() => {
    if (open) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filters]);

  // Clear selection when closing
  React.useEffect(() => {
    if (!open) clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const totalCount = result?.totalCount ?? 0;
  const pageCount = result?.pageCount ?? 1;
  const curPage = result?.curPage ?? 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>Media Library {totalCount ? `(${totalCount})` : ""}</DialogTitle>
          <DialogDescription>Manage and pick media files</DialogDescription>
        </DialogHeader>

        <MediaBrowser
          filters={{
            search: filters.search,
            sort: filters.sort,
            perPage: filters.perPage,
            page: filters.page,
          }}
          setFilters={setFilters}
          items={result?.data ?? []}
          totalCount={totalCount}
          pageCount={pageCount}
          curPage={curPage}
          loading={loading}
          onAfterMutation={() => fetch(true)}
          enableInsert={!!onInsert}
          onInsert={(items) => {
            onInsert?.(items);
            onOpenChange(false);
          }}
          // gridMaxCols={4}
        />
      </DialogContent>
    </Dialog>
  );
}
