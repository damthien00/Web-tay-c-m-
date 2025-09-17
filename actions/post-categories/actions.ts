"use server";
import {PostCategory} from "@prisma/client";
import {getErrorMessage} from "@/actions/utils/utils";
import prisma from "@/lib/prisma";
import {TPostCategoryCreateSchema, TPostCategoryUpdateSchema} from "./validations";
import {revalidatePath} from "next/cache";

export const createPostCategory = async (values: TPostCategoryCreateSchema): Promise<{
	data: PostCategory | null,
	error: string | null
}> => {
	try {
		const res = await prisma.postCategory.create({
			data: values
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
export const updatePostCategory = async (id: string, values: TPostCategoryUpdateSchema): Promise<{
	data: PostCategory | null,
	error: string | null
}> => {
	try {
		const res = await prisma.postCategory.update({
			where: {id},
			data: values
		})
		revalidatePath('/admin/post-categories')
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

export const deletePostCategories = async (ids: string[]) => {
	try {
		// 1) Disconnect categories from Posts (remove from categoryIDs and clear mainCategoryId if needed)
		const postsWithAnyCategory = await prisma.post.findMany({
			where: {
				OR: [
					{ categoryIDs: { hasSome: ids } },
					{ mainCategoryId: { in: ids } },
				],
			},
			select: { id: true, categoryIDs: true, mainCategoryId: true },
		})

		await Promise.all(
			postsWithAnyCategory.map((post) => {
				const filteredCategoryIDs = (post.categoryIDs ?? []).filter((cid) => !ids.includes(cid))
				const clearMain = post.mainCategoryId && ids.includes(post.mainCategoryId)
				return prisma.post.update({
					where: { id: post.id },
					data: {
						categoryIDs: { set: filteredCategoryIDs },
						...(clearMain ? { mainCategoryId: null } : {}),
					},
				})
			})
		)

		// 2) Delete the categories
		const res = await prisma.postCategory.deleteMany({
			where: {
				id: {
					in: ids
				}
			},
		})
		revalidatePath('/admin/post-categories')
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

export const deletePostCategory = async (id: string) => {
	try {
		// 1) Disconnect this category from Posts (remove from categoryIDs and clear mainCategoryId if needed)
		const postsWithCategory = await prisma.post.findMany({
			where: {
				OR: [
					{ categoryIDs: { has: id } },
					{ mainCategoryId: id },
				],
			},
			select: { id: true, categoryIDs: true, mainCategoryId: true },
		})

		await Promise.all(
			postsWithCategory.map((post) => {
				const filteredCategoryIDs = (post.categoryIDs ?? []).filter((cid) => cid !== id)
				const clearMain = post.mainCategoryId === id
				return prisma.post.update({
					where: { id: post.id },
					data: {
						categoryIDs: { set: filteredCategoryIDs },
						...(clearMain ? { mainCategoryId: null } : {}),
					},
				})
			})
		)

		// 2) Delete the category
		const res = await prisma.postCategory.delete({
			where: { id }
		})
		revalidatePath('/admin/post-categories')
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

