"use client"
import HomePage from "@/app/(public)/home-page";
import PublicLayout from "@/app/(public)/public-layout";
import {AuthWrapper} from "@/components/app/AuthWrapper";
import { useSession } from "@/lib/auth-client";

export default () => {
	const session = useSession();
	const isAuthenticated = !!session.data?.user;

	return (
		<>
			{isAuthenticated ? (
				<PublicLayout>
					<HomePage/>
				</PublicLayout>
			) : (
				<AuthWrapper onAuthenticated={() => {}} />
			)}
		</>
	)
}
