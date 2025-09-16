import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {signOut, useSession} from "@/lib/auth-client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {useRouter} from "next/navigation";

export function ProfileButton() {
	const session = useSession()
	const user = session.data?.user
	const router = useRouter()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<div className={'flex items-center gap-2'}>
					<Avatar title={user?.name}>
						<AvatarImage src={user?.image || "https://github.com/shadcn.png"} />
						<AvatarFallback>AV</AvatarFallback>
					</Avatar>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-40" align="end">
				<DropdownMenuItem asChild>
					<Link href={'/admin/profile'}>Profile</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={async () => {
					try {
						await signOut()
					} catch (error) {
						console.error('Error signing out:', error)
					}
					router.push('/auth/sign-in')
				}}>
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
