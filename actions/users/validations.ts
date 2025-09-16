import { Prisma, Role, User } from '@prisma/client'
import { z } from 'zod'

export type TUser = User
export type TUserWithRelations = Prisma.UserGetPayload<{
  include: {
    accounts: true,
    sessions: true,
  }
}>

export const searchUserSchema = z.object({
  search: z.string().optional(),

  page: z.coerce.number().optional().default(1),
  per_page: z.coerce.number().optional().default(10),
  sort: z.string().optional(), // name.asc, createdAt.desc, email.asc, role.desc
  from: z.string().optional(),
  to: z.string().optional(),
  operator: z.enum(['and', 'or']).optional(),
})
export type TSearchUserSchema = z.infer<typeof searchUserSchema>

export const defaultUser: TUserCreateSchema = {
  name: '',
  email: '',
  role: Role.USER,
  emailVerified: false,
  image: ''
}

export const userCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  role: z.enum(Role).default(Role.USER),
  emailVerified: z.coerce.boolean().default(false),
  image: z.url().optional().nullable()
})
export type TUserCreateSchema = z.infer<typeof userCreateSchema>

export const userUpdateSchema = userCreateSchema.partial()
export type TUserUpdateSchema = z.infer<typeof userUpdateSchema>
