import UserForm from "@/src/components/admin/users/UserForm";

export default async function AddUserPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Add New User</h1>
      <p className="text-muted-foreground mt-2">Create a new user.</p>
      <UserForm />
    </div>
  );
}
