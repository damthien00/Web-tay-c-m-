"use server"

import {TProfileUpdateSchema} from "@/actions/profile/validations";
import {me} from "@/actions/profile/me";
import prisma from "@/lib/prisma";

export async function updateProfile(values: TProfileUpdateSchema) {
	try {
		const currentUser = await me()
		if(!currentUser) return {success: false, error: 'User not found'}

		const res = await prisma.user.update({
			where: {id: currentUser.id},
			data: values,
		})
		return {success: true, data: res}
	} catch (error) {
		console.log(error)
		return {success: false, error: 'Something went wrong'}
	}
}
