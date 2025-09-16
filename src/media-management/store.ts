import { create } from "zustand"
import { getMedias } from "@/actions/media/queries"
import type { TMedia, TSearchMediaSchema } from "@/actions/media/validations"

export type MediaSelectionState = {
  selectedIds: string[]
  toggle: (id: string) => void
  setSelected: (ids: string[]) => void
  clear: () => void
  isSelected: (id: string) => boolean
  count: () => number
}

export const useMediaSelectionStore = create<MediaSelectionState>((set, get) => ({
  selectedIds: [],
  toggle: (id: string) => {
    const curr = new Set(get().selectedIds)
    if (curr.has(id)) curr.delete(id)
    else curr.add(id)
    set({ selectedIds: Array.from(curr) })
  },
  setSelected: (ids: string[]) => set({ selectedIds: Array.from(new Set(ids)) }),
  clear: () => set({ selectedIds: [] }),
  isSelected: (id: string) => get().selectedIds.includes(id),
  count: () => get().selectedIds.length,
}))

// Store for caching media results and managing filters for modal usage
export type MediaFilters = {
  search: string
  sort: string // e.g. "createdAt.desc"
  page: number
  perPage: number
}

export type MediaListResponse = {
  data: TMedia[]
  curPage: number
  perPage: number
  pageCount: number
  totalCount: number
  error: string | null
}

export type MediaStoreState = {
  filters: MediaFilters
  loading: boolean
  error: string | null
  result: MediaListResponse | null
  cache: Record<string, MediaListResponse>
  setFilters: (updates: Partial<MediaFilters>) => void
  resetFilters: () => void
  fetch: (force?: boolean) => Promise<void>
  keyFromFilters: (f?: MediaFilters) => string
  clearCache: () => void
}

const defaultFilters: MediaFilters = {
  search: "",
  sort: "createdAt.desc",
  page: 1,
  perPage: 12,
}

export const useMediaStore = create<MediaStoreState>((set, get) => ({
  filters: { ...defaultFilters },
  loading: false,
  error: null,
  result: null,
  cache: {},
  setFilters: (updates) => {
    const prev = get().filters
    const next: MediaFilters = { ...prev, ...updates }
    // If changing search/sort/perPage, reset to first page unless page explicitly provided
    if (
      (updates.search !== undefined && updates.page === undefined) ||
      (updates.sort !== undefined && updates.page === undefined) ||
      (updates.perPage !== undefined && updates.page === undefined)
    ) {
      next.page = 1
    }
    set({ filters: next })
  },
  resetFilters: () => set({ filters: { ...defaultFilters } }),
  keyFromFilters: (f = get().filters) =>
    JSON.stringify({
      s: f.search || "",
      o: f.sort || "createdAt.desc",
      p: f.page || 1,
      pp: f.perPage || 12,
    }),
  clearCache: () => set({ cache: {} }),
  fetch: async (force = false) => {
    const f = get().filters
    const key = get().keyFromFilters(f)
    const cache = get().cache

    if (!force && cache[key]) {
      set({ result: cache[key], error: null })
      return
    }

    set({ loading: true, error: null })
    try {
      const res = await getMedias({
        search: f.search || undefined,
        page: f.page,
        per_page: f.perPage,
        sort: f.sort,
      } as TSearchMediaSchema)

      const response: MediaListResponse = {
        data: res.data,
        curPage: res.curPage,
        perPage: res.perPage,
        pageCount: res.pageCount,
        totalCount: res.totalCount,
        error: res.error,
      }

      set((state) => ({
        result: response,
        cache: { ...state.cache, [key]: response },
        loading: false,
        error: res.error,
      }))
    } catch (e: any) {
      set({ loading: false, error: e?.message || String(e) })
    }
  },
}))
