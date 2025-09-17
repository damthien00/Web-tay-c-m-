"use server";
import { Media } from "@prisma/client";
import { getErrorMessage } from "@/actions/utils/utils";
import prisma from "@/lib/prisma";
import { TMediaCreateSchema } from "./validations";
import { revalidatePath } from "next/cache";

export const createMedia = async (values: TMediaCreateSchema): Promise<{
	data: Media | null,
	error: string | null
}> => {
	try {
		const res = await prisma.media.create({
			data: values,
		})
		revalidatePath('/admin/media')
		return {
			data: res,
			error: null
		}
	} catch (e) {
		console.error(e)
		return {
			data: null,
			error: getErrorMessage(e)
		}
	}
}

export const deleteMedias = async (ids: string[]) => {
	try {
		const res = await prisma.media.deleteMany({
			where: {
				id: {
					in: ids,
				}
			}
		})
		revalidatePath('/admin/media')
		return {
			data: res,
			error: null
		}
	} catch (e) {
		console.error(e)
		return {
			data: null,
			error: getErrorMessage(e)
		}
	}
}

export const deleteMedia = async (id: string) => {
	try {
		const res = await prisma.media.delete({
			where: { id }
		})
		revalidatePath('/admin/media')
		return {
			data: res,
			error: null
		}
	} catch (e) {
		console.error(e)
		return {
			data: null,
			error: getErrorMessage(e)
		}
	}
}
