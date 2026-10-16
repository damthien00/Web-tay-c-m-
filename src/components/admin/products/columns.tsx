"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TProduct } from "@/actions/products/validations";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deleteProduct, updateProduct } from "@/actions/products/actions";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export const productColumns: ColumnDef<TProduct>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(checked) =>
                    table.toggleAllPageRowsSelected(!!checked)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(checked) => row.toggleSelected(!!checked)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
    },
    {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
            <span>
                {row.original.price.toLocaleString("vi-VN")} ₫
            </span>
        ),
    },
    {
        accessorKey: "oldPrice",
        header: "Old price",
        cell: ({ row }) => {
            const oldPrice = row.original.oldPrice;

            return (
                <span className="text-muted-foreground">
                    {oldPrice != null
                        ? `${oldPrice.toLocaleString("vi-VN")} ₫`
                        : "-"}
                </span>
            );
        },
    },
    {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
            <span>{row.original.rating.toFixed(1)} / 5</span>
        ),
    },
    {
        accessorKey: "sold",
        header: "Sold",
        cell: ({ row }) => (
            <span>{row.original.sold.toLocaleString("vi-VN")}</span>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
            const value = row.original.createdAt;
            const date =
                value instanceof Date ? value : new Date(value);

            return (
                <span>
                    {Number.isNaN(date.getTime())
                        ? "-"
                        : date.toLocaleString("vi-VN")}
                </span>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => (
            <ProductActions
                product={row.original}
            />
        ),
    },
];

function ProductActions({
    product,
}: {
    product: TProduct;
}) {
    const [isPending, startTransition] = React.useTransition();

    const handleDelete = () => {
        if (
            !confirm(
                `Bạn có chắc muốn xóa sản phẩm "${product.name}" không?`
            )
        ) {
            return;
        }

        startTransition(async () => {
            try {
                const res = await deleteProduct(product.id);

                if (res.error) {
                    toast.error(res.error);
                    return;
                }

                toast.success("Xóa sản phẩm thành công");
            } catch (error) {
                console.error(error);
                toast.error("Không thể xóa sản phẩm");
            }
        });
    };

    return (
        <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
                <Link href={`/admin/products/${product.id}`}>
                    Edit
                </Link>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
            >
                {isPending ? "Deleting..." : "Delete"}
            </Button>
        </div>
    );
}