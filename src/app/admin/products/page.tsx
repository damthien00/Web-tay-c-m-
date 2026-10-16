import {getProducts} from "@/actions/products/queries";
import {searchProductSchema} from "@/actions/products/validations";
import ProductList from "@/components/admin/products/ProductList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProductsPage({searchParams}: {
	searchParams: Record<string, string | string[] | undefined>;
}) {
	const awaitedSearchParams = await searchParams;
	const productResponse = await getProducts({...searchProductSchema.parse(awaitedSearchParams)})

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Product Management ({productResponse.totalCount})</h1>
          <p className="text-muted-foreground mt-2">Manage your posts here.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/add">New Product</Link>
        </Button>
      </div>
	    <ProductList
	      data={productResponse.data}
        curPage={productResponse.curPage}
        perPage={productResponse.perPage}
        pageCount={productResponse.pageCount}
        totalCount={productResponse.totalCount}
	    />
    </div>
  );
}
