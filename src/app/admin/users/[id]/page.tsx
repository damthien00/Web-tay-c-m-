import { getUserById } from "@/actions/users/queries";
import UserForm from "@/components/admin/users/UserForm";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const awaitedParams = await params;
  const { data: user, error } = await getUserById(awaitedParams.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Edit User</h1>
      <p className="text-muted-foreground mt-2">{user ? `Editing: ${user.name} (${user.email})` : "Update existing user."}</p>
      {error && (
        <div className="text-sm text-destructive mt-4">{error}</div>
      )}
      <UserForm user={user} />
    </div>
  );
}
