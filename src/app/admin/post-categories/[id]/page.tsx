import {getPostCategoryById} from "@/actions/post-categories/queries";
import PostCategoryForm from "@/components/admin/post-categories/PostCategoryForm";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const awaitedParams = await params;
	const { data, error } = await getPostCategoryById(awaitedParams.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Edit Post Category</h1>
      <p className="text-muted-foreground mt-2">{data ? `Editing: ${data.name}` : "Update existing data."}</p>
      {error && (
        <div className="text-sm text-destructive mt-4">{error}</div>
      )}
	    <PostCategoryForm data={data} />
    </div>
  );
}
