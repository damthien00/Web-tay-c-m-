"use server"

import {Role} from "@prisma/client";

import {me} from "@/actions/profile/me";
import prisma from "@/lib/prisma";

export type TAppRole = Role[number]

export async function getCurrentUserRole(){
	const current = await me()
	if(!current) return null
	const user = await prisma.user.findUnique({where: {id: current.id}})
	return user?.role ?? null
}
export async function ensureRole(required: TAppRole | TAppRole[]) {
	const role = await getCurrentUserRole()
	if(!role) return false
	if(Array.isArray(required)) return required.includes(role)

	return role === required
}
