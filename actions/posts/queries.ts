"use server";
import {TPost, TPostWithRelations, TSearchPostSchema} from "./validations";
import prisma from "@/lib/prisma";
import {getErrorMessage} from "@/actions/utils/utils";
import {Prisma} from "@prisma/client";
import PostWhereInput = Prisma.PostWhereInput;

export const getPostById = async (id: string): Promise<{
	data: TPostWithRelations | null,
	error: string | null
}> => {
	try {
		const res = await prisma.post.findUnique({
			where: {id},
			include: {
				categories: true,
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
export const getPosts = async (inputs: TSearchPostSchema): Promise<{
	data: TPost[],
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
		const expressions: PostWhereInput[] = [
			search ? {
				OR: [
					{title: {contains: search, mode: 'insensitive'}},
					{content: {contains: search, mode: 'insensitive'}}
				]
			} : {},
			from ? {createdAt: {gte: new Date(from)}} : {},
			to ? {createdAt: {lte: new Date(to)}} : {},
		].filter(Boolean) as PostWhereInput[]

		const where = operator === 'and' ? {
			AND: expressions
		} : {
			OR: expressions
		}

		const [total, data] = await prisma.$transaction(async (tx) => {
			const total = await tx.post.count({
				where
			})
			const data = await tx.post.findMany({
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
