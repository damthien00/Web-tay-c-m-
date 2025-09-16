"use server"

import {auth} from "@/src/lib/auth"
import {headers} from "next/headers"

export async function me(){
	const session = await auth.api.getSession({
		headers: await headers()
	})
	return session?.user ?? null
}
