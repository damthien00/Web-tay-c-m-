"use server";
import {Post} from "@prisma/client";
import {getErrorMessage} from "@/actions/utils/utils";
import prisma from "@/lib/prisma";
import {TPostCreateSchema, TPostUpdateSchema} from "./validations";
import {revalidatePath} from "next/cache";

export const createPost = async (inputs: TPostCreateSchema): Promise<{
	data: Post | null,
	error: string | null
}> => {
	try {
		let {mainCategoryId, ...values} = inputs

		if(values.categoryIDs.length > 0 && (mainCategoryId === 'none' || !mainCategoryId)){
			mainCategoryId = values.categoryIDs[0]
		}
		const res = await prisma.post.create({
			data: {
				...values,
				mainCategoryId: mainCategoryId === 'none' ? null : mainCategoryId,
				categories: values.categoryIDs ? {
					connect: values.categoryIDs.map(categoryId => ({id: categoryId}))
				} : undefined
			},
			include: {
				categories: true // Include categories in the response
			}
		})

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
export const updatePost = async (id: string, inputs: TPostUpdateSchema): Promise<{
	data: Post | null,
	error: string | null
}> => {
	try {
		let {mainCategoryId, ...values} = inputs
		if (values.categoryIDs && (values.categoryIDs || []).length > 0 && (mainCategoryId === 'none' || !mainCategoryId)) {
			mainCategoryId = values.categoryIDs[0]
		}

		const res = await prisma.post.update({
			where: {id},
			data: {
				...values,
				mainCategoryId: mainCategoryId === 'none' ? null : mainCategoryId,
				categories: values.categoryIDs ? {
					set: [], // First disconnect all existing categories
					connect: values.categoryIDs.map(categoryId => ({id: categoryId})) // Then connect the new ones
				} : undefined
			},
			include: {
				categories: true // Include categories in the response
			}
		})

		revalidatePath('/admin/posts')

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

export const deletePosts = async (ids: string[]) => {
	try {
		const res = await prisma.post.deleteMany({
			where: {
				id: {
					in: ids
				}
			},
		})
		revalidatePath('/admin/posts')
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

export const deletePost = async (id: string) => {
	try {
		const res = await prisma.post.delete({
			where: { id }
		})
		revalidatePath('/admin/posts')
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

