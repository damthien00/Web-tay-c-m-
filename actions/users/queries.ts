"use server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getErrorMessage } from "@/actions/utils/utils";
import { TSearchUserSchema, TUser, TUserWithRelations } from "./validations";
import UserWhereInput = Prisma.UserWhereInput;

export const getUserById = async (id: string): Promise<{
  data: TUserWithRelations | null,
  error: string | null
}> => {
  try {
    const res = await prisma.user.findUnique({
      where: { id },
      include: {
        accounts: true,
        sessions: true,
      }
    })
    return { data: res, error: null }
  } catch (e) {
    console.error(e)
    return { data: null, error: getErrorMessage(e) }
  }
}

export const getUsers = async (inputs: TSearchUserSchema): Promise<{
  data: TUser[],
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
      sort, // name.desc, email.asc, createdAt.desc, createdAt.asc
      from,
      to,
      operator = 'and',
    } = inputs

    // sort
    const allowedSortColumns = new Set(["name", "email", "createdAt", "updatedAt", "role", "emailVerified"])
    let [column, order] = (sort?.split('.'))?.filter(Boolean) as [string, string] ?? ['createdAt', 'desc']
    if (!allowedSortColumns.has(column)) column = 'createdAt'
    const ord: 'asc' | 'desc' = order === 'asc' ? 'asc' : 'desc'

    // where
    const expressions: UserWhereInput[] = [
      search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      } : {},
      from ? { createdAt: { gte: new Date(from) } } : {},
      to ? { createdAt: { lte: new Date(to) } } : {},
    ].filter(Boolean) as UserWhereInput[]

    const where = operator === 'and' ? { AND: expressions } : { OR: expressions }

    const [total, data] = await prisma.$transaction(async (tx) => {
      const total = await tx.user.count({ where })
      const data = await tx.user.findMany({
        where,
        skip: (page - 1) * per_page,
        take: per_page,
        orderBy: { [column]: ord } as any,
      })
      return [total, data]
    })

    return {
      data,
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
