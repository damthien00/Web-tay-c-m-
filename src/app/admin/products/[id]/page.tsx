import { getProductById } from "@/actions/products/queries";
import ProductForm from "@/components/admin/products/ProductForm";
import { ArrowLeft, Link } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const awaitedParams = await params;

    const { data: product, error } = await getProductById(
        awaitedParams.id
    );

    if (error) {
        return (
            <div className="mt-4 text-sm text-destructive">
                {error}
            </div>
        );
    }

    if (!product) {
        notFound();
    }
    return (
        <div>
            <div className="flex items-center gap-2 mb-2"> 
                <a
                    href="/admin/products"
                    className="text-sm text-blue-600 hover:underline"
                >
                    <ArrowLeft size={20} />
                </a>
                <h1 className="text-2xl font-semibold">
                    Chỉnh sửa sản phẩm
                </h1>
            </div>

            <p className="mt-2 text-muted-foreground">
                Đang chỉnh sửa: {product.name}
            </p>

            <ProductForm product={product} />
        </div>
    );
}