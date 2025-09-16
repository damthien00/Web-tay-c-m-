import { getPostById } from "@/actions/posts/queries";
import PostForm from "@/src/components/admin/posts/PostForm";
import {getPostCategories} from "@/actions/post-categories/queries";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const awaitedParams = await params;
	const { data: post, error } = await getPostById(awaitedParams.id);
	const {data: postCategories} = await getPostCategories({
		per_page: 1000,
		page: 1
	})

  return (
    <div>
      <h1 className="text-2xl font-semibold">Edit Post</h1>
      <p className="text-muted-foreground mt-2">{post ? `Editing: ${post.title}` : "Update existing post."}</p>
      {error && (
        <div className="text-sm text-destructive mt-4">{error}</div>
      )}
      <PostForm post={post} postCategories={postCategories} />
    </div>
  );
}
