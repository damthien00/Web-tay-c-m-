"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useMediaSelectionStore, useMediaStore } from "@/media-management/store";
import { deleteMedia, deleteMedias, createMedia } from "@/actions/media/actions";
import { uploadFile } from "@/lib/upload-image";
import type { TMedia } from "@/actions/media/validations";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2, X, Upload } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export type MediaBrowserProps = {
  // Controlled filters from parent (URL or store)
  filters: { search: string; sort: string; perPage: number; page: number };
  setFilters: (updates: Partial<{ search: string; sort: string; perPage: number; page: number }>) => void;
  // Data payload
  items: TMedia[];
  totalCount: number;
  pageCount: number;
  curPage: number;
  // Loading state (optional for URL mode)
  loading?: boolean;
  // Called after mutations (upload/delete) to refresh data (router.refresh or store.fetch(true))
  onAfterMutation?: () => Promise<void> | void;
  // Optional insert capability
  enableInsert?: boolean;
  onInsert?: (items: TMedia[]) => void;
  // Optional: cap the maximum number of grid columns (e.g., 4 for modal)
  gridMaxCols?: number;
};

export default function MediaBrowser(props: MediaBrowserProps) {
  const { filters, setFilters, items, totalCount, pageCount, curPage, loading, onAfterMutation, enableInsert, onInsert, gridMaxCols } = props;

  const { selectedIds, toggle, clear, isSelected, count } = useMediaSelectionStore();

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  // Upload handlers
  const onClickUpload = () => fileInputRef.current?.click();
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      if (!res || !res.ok) {
        toast.error("Upload failed");
        return;
      }
      const info = await res.json();
      const url: string = info.secure_url || info.url;
      const size: number = info.bytes || file.size;
      const fileName: string = file.name || `${info.original_filename || "image"}.${info.format || "jpg"}`;
      const mimeType: string = file.type || `image/${info.format || "jpeg"}`;

      const saved = await createMedia({ url, fileName, mimeType, size });
      if ((saved as any)?.error) {
        toast.error(String((saved as any).error));
        return;
      }
      toast.success("Uploaded successfully");
      await onAfterMutation?.();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error(err);
      toast.error(String(err?.message || err));
    } finally {
      setIsUploading(false);
    }
  };

  // Delete handlers
  const onDeleteSelected = () => {
    const ids = selectedIds;
    if (ids.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${ids.length} selected media item(s)?`)) return;
    startTransition(async () => {
      try {
        const res = await deleteMedias(ids);
        if ((res as any)?.error) {
          console.error((res as any).error);
          toast.error(String((res as any).error));
          return;
        }
        toast.success(`Deleted ${ids.length} media item(s) successfully`);
        clear();
        await onAfterMutation?.();
      } catch (err: any) {
        console.error(err);
        toast.error(String(err?.message || err));
      }
    });
  };

  const onDeleteSingle = (id: string) => {
    if (!confirm(`Delete this media?`)) return;
    startTransition(async () => {
      try {
        const res = await deleteMedia(id);
        if ((res as any)?.error) {
          console.error((res as any).error);
          toast.error(String((res as any).error));
          return;
        }
        toast.success(`Deleted successfully`);
        await onAfterMutation?.();
      } catch (err: any) {
        console.error(err);
        toast.error(String(err?.message || err));
      }
    });
  };

  // Build selected media objects from store cache for insert
  const getSelectedItemsFromCache = (): TMedia[] => {
    const store = useMediaStore.getState();
    const all: Record<string, TMedia> = {};
    Object.values(store.cache).forEach((res) => {
      for (const m of res.data) all[m.id] = m;
    });
    return selectedIds.map((id) => all[id]).filter(Boolean);
  };

  const [searchValue, setSearchValue] = React.useState(filters.search ?? "");
  React.useEffect(() => {
    setSearchValue(filters.search ?? "");
  }, [filters.search]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="space-y-2">
        {/* Row 1: Search */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search media..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setFilters({ search: searchValue, page: 1 });
            }}
          />
          <Button variant="outline" size="sm" onClick={() => setFilters({ search: searchValue, page: 1 })}>
            Search
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          <Button variant="default" size="sm" onClick={onClickUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
        {/* Row 2: Filters and Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Select defaultValue={filters.sort} onValueChange={(val) => setFilters({ sort: val, page: 1 })}>
              <SelectTrigger className="w-[190px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt.desc">Newest</SelectItem>
                <SelectItem value="createdAt.asc">Oldest</SelectItem>
                <SelectItem value="fileName.asc">Name A-Z</SelectItem>
                <SelectItem value="fileName.desc">Name Z-A</SelectItem>
                <SelectItem value="size.desc">Size desc</SelectItem>
                <SelectItem value="size.asc">Size asc</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue={String(filters.perPage)} onValueChange={(val) => setFilters({ perPage: Number(val), page: 1 })}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 / page</SelectItem>
                <SelectItem value="24">24 / page</SelectItem>
                <SelectItem value="48">48 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            {count() > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => clear()}
                  title="Clear selection"
                  aria-label="Clear selection"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={onDeleteSelected}
                  disabled={isPending}
                  title={`Delete selected (${count()})`}
                  aria-label="Delete selected"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </>
            )}
            {enableInsert && onInsert && (
              <Button
                size="icon"
                onClick={() => {
                  const items = getSelectedItemsFromCache();
                  if (items.length === 0) return;
                  onInsert(items);
                }}
                disabled={count() === 0}
                title={`Insert selected (${count()})`}
                aria-label="Insert selected"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center text-muted-foreground py-16">Loading...</div>
      ) : totalCount === 0 ? (
        <div className="text-center text-muted-foreground py-16">No media found.</div>
      ) : (
        <>
          <div className={gridMaxCols && gridMaxCols <= 4 ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"}>
            {items.map((m) => (
              <div key={m.id} className="border rounded-md overflow-hidden group bg-card">
                <div className="relative aspect-square bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.fileName} className="absolute inset-0 size-full object-cover" loading="lazy" />
                  <div className="absolute left-2 top-2 flex items-center gap-2">
                    <Checkbox checked={isSelected(m.id)} onCheckedChange={() => toggle(m.id)} />
                  </div>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <div className="text-sm font-medium truncate" title={m.fileName}>
                    {m.fileName}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>{formatBytes(m.size)}</span>
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => onDeleteSingle(m.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={curPage > 1 ? "#" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        if (curPage > 1) setFilters({ page: curPage - 1 });
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setFilters({ page: p });
                        }}
                        isActive={p === curPage}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href={curPage < pageCount ? "#" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        if (curPage < pageCount) setFilters({ page: curPage + 1 });
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
