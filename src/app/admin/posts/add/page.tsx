import PostForm from "@/src/components/admin/posts/PostForm";
import {getPostCategories} from "@/actions/post-categories/queries";

export default async function AddPostPage() {
	const {data: postCategories} = await getPostCategories({
		per_page: 1000,
		page: 1
	})

  return (
    <div>
      <h1 className="text-2xl font-semibold">Add New Post</h1>
      <p className="text-muted-foreground mt-2">Create a new post.</p>
      <PostForm postCategories={postCategories} />
    </div>
  );
}
