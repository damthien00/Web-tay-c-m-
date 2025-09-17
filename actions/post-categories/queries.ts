"use server";
import {TPostCategory, TPostCategoryWithRelations, TSearchPostCategorySchema} from "./validations";
import prisma from "@/lib/prisma";
import {getErrorMessage} from "@/actions/utils/utils";
import {Prisma} from "@prisma/client";
import PostCategoryWhereInput = Prisma.PostCategoryWhereInput;

export const getPostCategoryById = async (id: string): Promise<{
	data: TPostCategoryWithRelations | null,
	error: string | null
}> => {
	try {
		const res = await prisma.postCategory.findUnique({
			where: {id},
			include: {
				posts: true,
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
export const getAllPostCategories = async (): Promise<{
	data: TPostCategoryWithRelations[],
	error: string | null
}> => {
	try {
		const res = await prisma.postCategory.findMany({
			include: {
				posts: true,
			}
		})
		return {
			data: res,
			error: null
		}
	} catch (e) {
		console.error(e)
		return {
			data: [],
			error: getErrorMessage(e)
		}
	}
}
export const getPostCategories = async (inputs: TSearchPostCategorySchema): Promise<{
	data: TPostCategory[],
	curPage: number,
	perPage: number,
	pageCount: number,
	totalCount: number,
	error: string | null
}> => {
	try {
		const {
			search,
			page,
			per_page,
			sort, // title.desc, title.asc, createdAt.desc, createdAt.asc
			from,
			to,
			operator = 'and',
		} = inputs

		// sort
		const [column, order] = (sort?.split('.'))?.filter(Boolean) as [string, string] ?? ['createdAt', 'desc']

		// where
		const expressions: PostCategoryWhereInput[] = [
			search ? {
				OR: [
					{title: {contains: search, mode: 'insensitive'}},
					{content: {contains: search, mode: 'insensitive'}}
				]
			} : {},
			from ? {createdAt: {gte: new Date(from)}} : {},
			to ? {createdAt: {lte: new Date(to)}} : {},
		].filter(Boolean) as PostCategoryWhereInput[]

		const where = operator === 'and' ? {
			AND: expressions
		} : {
			OR: expressions
		}

		const [total, data] = await prisma.$transaction(async (tx) => {
			const total = await tx.postCategory.count({
				where
			})
			const data = await tx.postCategory.findMany({
				where,
				skip: (page - 1) * per_page,
				take: per_page,
				orderBy: {
					[column]: order
				}
			})
			return [total, data]
		})

		return {
			data: data,
			curPage: page,
			perPage: per_page,
			pageCount: Math.ceil(total / per_page),
			totalCount: total,
			error: null
		}
	} catch (e) {
		console.error(e)
		return {
			data: [],
			curPage: 1,
			perPage: 10,
			pageCount: 1,
			totalCount: 0,
			error: getErrorMessage(e)
		}
	}
}
