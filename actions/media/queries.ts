"use server";
import { TMedia, TMediaWithRelations, TSearchMediaSchema } from "./validations";
import prisma from "@/src/lib/prisma";
import { getErrorMessage } from "@/actions/utils/utils";
import { Prisma } from "@prisma/client";
import MediaWhereInput = Prisma.MediaWhereInput;

export const getMediaById = async (id: string): Promise<{
	data: TMediaWithRelations | null,
	error: string | null
}> => {
	try {
		const res = await prisma.media.findUnique({
			where: { id },
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

export const getMedias = async (inputs: TSearchMediaSchema): Promise<{
	data: TMedia[],
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
			sort, // e.g., fileName.desc, createdAt.asc
			from,
			to,
			operator = 'and',
		} = inputs

		// sort
		const [column, order] = (sort?.split('.'))?.filter(Boolean) as [string, string] ?? ['createdAt', 'desc']

		// where
		const expressions: MediaWhereInput[] = [
			search ? {
				OR: [
					{ url: { contains: search, mode: 'insensitive' } },
					{ fileName: { contains: search, mode: 'insensitive' } },
					{ mimeType: { contains: search, mode: 'insensitive' } },
				]
			} : {},
			from ? { createdAt: { gte: new Date(from) } } : {},
			to ? { createdAt: { lte: new Date(to) } } : {},
		].filter(Boolean) as MediaWhereInput[]

		const where = operator === 'and' ? { AND: expressions } : { OR: expressions }

		const [total, data] = await prisma.$transaction(async (tx) => {
			const total = await tx.media.count({ where })
			const data = await tx.media.findMany({
				where,
				skip: (page - 1) * per_page,
				take: per_page,
				orderBy: { [column]: order },
			})
			return [total, data] as const
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
			perPage: 12,
			pageCount: 1,
			totalCount: 0,
			error: getErrorMessage(e)
		}
	}
}
