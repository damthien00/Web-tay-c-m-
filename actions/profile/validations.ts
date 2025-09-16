import {z} from "zod";

export const profileUpdateSchema = z.object({
	name: z.string().min(1),
	image: z
	.string()
	.trim()
	.optional()
	.refine((val) => !val || val.length === 0 || /^https?:\/\//.test(val), {
		message: "Image must be a valid URL",
	}),
})

export type TProfileUpdateSchema = z.infer<typeof profileUpdateSchema>
