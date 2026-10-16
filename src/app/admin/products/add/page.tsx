import Link from "next/link";
import {getPostCategories} from "@/actions/post-categories/queries";
import ProductForm from "@/components/admin/products/ProductForm";
import { ArrowLeft } from "lucide-react";

export default async function AddPostPage() {
    const {data: postCategories} = await getPostCategories({
        per_page: 1000,
        page: 1
    })
  return (
    <div>
        <div className="flex items-center gap-2 mb-2">
         <Link
                href="/admin/products"
                  className="text-sm text-blue-600 hover:underline"
            >
        <ArrowLeft size={20} />
    </Link>
      <h1 className="text-2xl font-semibold">Add New Product</h1>
        </div>
      <p className="text-muted-foreground mt-2">Create a new product.</p>
      <ProductForm />
    </div>
  );
}
