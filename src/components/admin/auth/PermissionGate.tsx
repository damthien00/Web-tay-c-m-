import React from "react";
import {TAppRole, ensureRole} from "@/lib/permissions";

export default async function PermissionGate(props: {
	children: React.ReactNode;
	anyOf: TAppRole | TAppRole[];
	fallback?: React.ReactNode;
}) {
	const result = await ensureRole(props.anyOf)
	if (!result) {return props.fallback || null}
	return (
		<>
			{props.children}
		</>
	)
}
