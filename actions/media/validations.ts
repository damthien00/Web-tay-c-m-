import { Media, Prisma } from "@prisma/client"
import { z } from "zod"

export type TMedia = Media
export type TMediaWithRelations = Prisma.MediaGetPayload<{}>

export const searchMediaSchema = z.object({
	search: z.string().optional(),

	page: z.coerce.number().optional().default(1),
	per_page: z.coerce.number().optional().default(12),
	sort: z.string().optional(), // e.g., createdAt.desc, fileName.asc
	from: z.string().optional(),
	to: z.string().optional(),
	operator: z.enum(["and", "or"]).optional(),
})
export type TSearchMediaSchema = z.infer<typeof searchMediaSchema>

export const defaultMedia: TMediaCreateSchema = {
	url: "",
	fileName: "",
	mimeType: "",
	size: 0,
}

export const mediaCreateSchema = z.object({
	url: z.url({ message: "Invalid URL" }),
	fileName: z.string().min(1, { message: "File name is required" }),
	mimeType: z.string().min(1, { message: "MIME type is required" }),
	size: z.coerce.number().int().nonnegative(),
})
export type TMediaCreateSchema = z.infer<typeof mediaCreateSchema>
