import PostCategoryList from "@/components/admin/post-categories/PostCategoryList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {getPostCategories} from "@/actions/post-categories/queries";
import {searchPostCategorySchema} from "@/actions/post-categories/validations";

export default async function PostsPage({searchParams}: {
	searchParams: Record<string, string | string[] | undefined>;
}) {
	const awaitedSearchParams = await searchParams;
	const dataResponse = await getPostCategories({...searchPostCategorySchema.parse(awaitedSearchParams)})

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Post Category Management ({dataResponse.totalCount})</h1>
          <p className="text-muted-foreground mt-2">Manage your post categories here.</p>
        </div>
        <Button asChild>
          <Link href="/admin/post-categories/add">New Post Category</Link>
        </Button>
      </div>
	    <PostCategoryList
	      data={dataResponse.data}
        curPage={dataResponse.curPage}
        perPage={dataResponse.perPage}
        pageCount={dataResponse.pageCount}
        totalCount={dataResponse.totalCount}
	    />
    </div>
  );
}
