"use client";

import React from "react";
import { TProduct } from "@/actions/products/validations";
import { DataTable } from "@/components/data-table";
import { productColumns } from "./columns";
import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import type {
    PaginationState,
    SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { deleteProducts } from "@/actions/products/actions";
import { toast } from "sonner";

export default function ProductList(props: {
    data: TProduct[];
    curPage: number;
    perPage: number;
    pageCount: number;
    totalCount: number;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isPending, startTransition] = React.useTransition();

    // Cập nhật query trên URL
    const setQuery = (
        updates: Record<string, string | number | undefined | null>
    ) => {
        const sp = new URLSearchParams(searchParams.toString());

        for (const [key, value] of Object.entries(updates)) {
            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {
                sp.delete(key);
            } else {
                sp.set(key, String(value));
            }
        }

        const queryString = sp.toString();

        router.push(
            queryString ? `${pathname}?${queryString}` : pathname
        );
    };

    // Phân trang
    const handlePaginationChange = (state: PaginationState) => {
        setQuery({
            page: state.pageIndex + 1,
            per_page: state.pageSize,
        });
    };

    // Sắp xếp
    const handleSortingChange = (state: SortingState) => {
        const first = state[0];

        if (!first) {
            setQuery({ sort: null, page: 1 });
            return;
        }

        const sort = `${first.id}.${first.desc ? "desc" : "asc"}`;

        setQuery({
            sort,
            page: 1,
        });
    };

    // Tìm kiếm sản phẩm
    const handleGlobalFilterChange = (value: string) => {
        setQuery({
            search: value,
            page: 1,
        });
    };

    // Xóa nhiều sản phẩm
    const handleDeleteSelected = (
        selectedRowIds: string[],
        clearSelection: () => void
    ) => {
        const count = selectedRowIds.length;

        if (count === 0) return;

        if (
            !confirm(
                `Bạn có chắc chắn muốn xóa ${count} sản phẩm đã chọn không?`
            )
        ) {
            return;
        }

        startTransition(async () => {
            try {
                const res = await deleteProducts(selectedRowIds);

                if (res.error) {
                    console.error(res.error);
                    toast.error(
                        typeof res.error === "string"
                            ? res.error
                            : JSON.stringify(res.error)
                    );
                    return;
                }

                toast.success(
                    `Đã xóa thành công ${count} sản phẩm`
                );

                clearSelection();

                // Làm mới dữ liệu sau khi xóa
                router.refresh();
            } catch (error) {
                console.error(error);
                toast.error("Không thể xóa các sản phẩm đã chọn");
            }
        });
    };

    return (
        <div className="mt-4">
            <DataTable<TProduct, unknown>
                columns={productColumns}
                data={props.data}
                pageCount={props.pageCount}
                initialPageIndex={(props.curPage ?? 1) - 1}
                initialPageSize={props.perPage ?? 10}
                onPaginationChange={handlePaginationChange}
                onSortingChange={handleSortingChange}
                onGlobalFilterChange={handleGlobalFilterChange}
                renderSelectedActions={({
                    selectedRowIds,
                    clearSelection,
                }) => {
                    const count = selectedRowIds.length;

                    return (
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={isPending || count === 0}
                            onClick={() =>
                                handleDeleteSelected(
                                    selectedRowIds as string[],
                                    clearSelection
                                )
                            }
                        >
                            {isPending
                                ? "Đang xóa..."
                                : `Xóa sản phẩm đã chọn (${count})`}
                        </Button>
                    );
                }}
                getRowId={(row) => row.id}
            />
        </div>
    );
}