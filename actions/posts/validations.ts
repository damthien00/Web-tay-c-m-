import {Post, Prisma} from '@prisma/client'
import {z} from "zod";
import {isMongoId} from "validator";

export type TPost = Post
export type TPostWithRelations = Prisma.PostGetPayload<{
	include: {
		categories: true,
	}
}>

export const searchPostSchema = z.object({
	search: z.string().optional(),

	page: z.coerce.number().optional().default(1),
	per_page: z.coerce.number().optional().default(10),
	sort: z.string().optional(),
	from: z.string().optional(),
	to: z.string().optional(),
	operator: z.enum(['and', 'or']).optional(),
})
export type TSearchPostSchema = z.infer<typeof searchPostSchema>

export const defaultPost: TPostCreateSchema = {
	title: '',
	content: '',
	published: false,
	categoryIDs: [],
	mainCategoryId: ''
}
export const postCreateSchema = z.object({
	title: z.string().min(1),
	content: z.string(),
	published: z.coerce.boolean().default(false),
	categoryIDs: z.array(z.string().refine(isMongoId)).default([]),
	mainCategoryId: z.string().optional().nullable(),
})
export type TPostCreateSchema = z.infer<typeof postCreateSchema>

export const postUpdateSchema = postCreateSchema.partial()
export type TPostUpdateSchema = z.infer<typeof postUpdateSchema>
