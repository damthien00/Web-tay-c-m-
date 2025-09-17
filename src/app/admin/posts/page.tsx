import {getPosts} from "@/actions/posts/queries";
import {searchPostSchema} from "@/actions/posts/validations";
import PostList from "@/components/admin/posts/PostList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PostsPage({searchParams}: {
	searchParams: Record<string, string | string[] | undefined>;
}) {
	const awaitedSearchParams = await searchParams;
	const postResponse = await getPosts({...searchPostSchema.parse(awaitedSearchParams)})

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Post Management ({postResponse.totalCount})</h1>
          <p className="text-muted-foreground mt-2">Manage your posts here.</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/add">New Post</Link>
        </Button>
      </div>
	    <PostList
	      data={postResponse.data}
        curPage={postResponse.curPage}
        perPage={postResponse.perPage}
        pageCount={postResponse.pageCount}
        totalCount={postResponse.totalCount}
	    />
    </div>
  );
}
