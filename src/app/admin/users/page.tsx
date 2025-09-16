import { getUsers } from "@/actions/users/queries";
import { searchUserSchema } from "@/actions/users/validations";
import UserList from "@/src/components/admin/users/UserList";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export default async function UsersPage({searchParams}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const awaitedSearchParams = await searchParams;
  const userResponse = await getUsers({ ...searchUserSchema.parse(awaitedSearchParams) })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management ({userResponse.totalCount})</h1>
          <p className="text-muted-foreground mt-2">Manage your users here.</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/add">New User</Link>
        </Button>
      </div>
      <UserList
        data={userResponse.data}
        curPage={userResponse.curPage}
        perPage={userResponse.perPage}
        pageCount={userResponse.pageCount}
        totalCount={userResponse.totalCount}
      />
    </div>
  );
}
