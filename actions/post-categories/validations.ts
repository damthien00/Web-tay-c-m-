import {PostCategory, Prisma} from '@prisma/client'
import {z} from "zod";

export type TPostCategory = PostCategory
export type TPostCategoryWithRelations = Prisma.PostCategoryGetPayload<{
	include: {
		posts: true,
	}
}>

export const searchPostCategorySchema = z.object({
	search: z.string().optional(),

	page: z.coerce.number().optional().default(1),
	per_page: z.coerce.number().optional().default(10),
	sort: z.string().optional(),
	from: z.string().optional(),
	to: z.string().optional(),
	operator: z.enum(['and', 'or']).optional(),
})
export type TSearchPostCategorySchema = z.infer<typeof searchPostCategorySchema>

export const defaultPostCategory: TPostCategoryCreateSchema = {
	name: '',
}
export const postCategoryCreateSchema = z.object({
	name: z.string().min(1),
})
export type TPostCategoryCreateSchema = z.infer<typeof postCategoryCreateSchema>

export const postCategoryUpdateSchema = postCategoryCreateSchema.partial()
export type TPostCategoryUpdateSchema = z.infer<typeof postCategoryUpdateSchema>
