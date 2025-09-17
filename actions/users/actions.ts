"use server";
import { User } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getErrorMessage } from "@/actions/utils/utils";
import { TUserCreateSchema, TUserUpdateSchema } from "./validations";
import { revalidatePath } from "next/cache";
import {auth} from "@/lib/auth";

export const createUser = async (inputs: TUserCreateSchema): Promise<{
  data: User | null,
  error: string | null
}> => {
  try {
    const res = await prisma.user.create({
      data: {
				id: new Date().getTime().toString(),
        name: inputs.name,
        email: inputs.email,
        role: inputs.role,
        emailVerified: inputs.emailVerified ?? false,
        image: inputs.image || undefined,
      },
    })

	  try {
		  await auth.api.requestPasswordReset({
			  body: {
				  email: inputs.email,
				  redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/auth/reset-password',
			  }
		  })
	  } catch (e) {
		  console.error(e)
	  }

    return { data: res, error: null }
  } catch (e: any) {
    console.error(e)
    return { data: null, error: getErrorMessage(e) }
  }
}

export const updateUser = async (id: string, inputs: TUserUpdateSchema): Promise<{
  data: User | null,
  error: string | null
}> => {
  try {
    const res = await prisma.user.update({
      where: { id },
      data: {
        ...(inputs.name !== undefined ? { name: inputs.name } : {}),
        ...(inputs.email !== undefined ? { email: inputs.email } : {}),
        ...(inputs.role !== undefined ? { role: inputs.role } : {}),
        ...(inputs.emailVerified !== undefined ? { emailVerified: inputs.emailVerified } : {}),
        ...(inputs.image !== undefined ? { image: inputs.image || undefined } : {}),
      }
    })
    revalidatePath('/admin/users')
    return { data: res, error: null }
  } catch (e) {
    console.error(e)
    return { data: null, error: getErrorMessage(e) }
  }
}

export const deleteUsers = async (ids: string[]) => {
  try {
    const res = await prisma.user.deleteMany({
      where: { id: { in: ids } },
    })
    revalidatePath('/admin/users')
    return { data: res, error: null }
  } catch (e) {
    console.error(e)
    return { data: null, error: getErrorMessage(e) }
  }
}

export const deleteUser = async (id: string) => {
  try {
    const res = await prisma.user.delete({ where: { id } })
    revalidatePath('/admin/users')
    return { data: res, error: null }
  } catch (e) {
    console.error(e)
    return { data: null, error: getErrorMessage(e) }
  }
}
