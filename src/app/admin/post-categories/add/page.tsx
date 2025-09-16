import PostCategoryForm from "@/components/admin/post-categories/PostCategoryForm";

export default async function AddPostPage() {

  return (
    <div>
      <h1 className="text-2xl font-semibold">Add New Post Category</h1>
      <p className="text-muted-foreground mt-2">Create a new post category.</p>
      <PostCategoryForm />
    </div>
  );
}
