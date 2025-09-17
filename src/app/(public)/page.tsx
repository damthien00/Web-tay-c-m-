import {AuthWrapper} from "@/components/app/AuthWrapper";
import PermissionGate from "@/components/admin/auth/PermissionGate";
import HomePageClient from "@/app/(public)/home-page-client";

export default () => {
	return (
		<>
			<PermissionGate
				anyOf={["ADMIN", "USER"]}
				fallback={
					<AuthWrapper />
				}
			>
				<HomePageClient/>
			</PermissionGate>
		</>
	)
}
