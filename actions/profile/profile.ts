"use server";

import prisma from "@/lib/prisma";
import { me } from "@/actions/profile/me";

export type UpsertProfileInput = {
  fullName: string;
  email?: string; // ignored; server will use session email
  phone?: string;
  location?: string;
  occupation?: string;
  birthDate?: string; // ISO date (yyyy-mm-dd) from client
  avatar?: string;
};

export type ProfileDTO = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  occupation: string;
  birthDate: string; // yyyy-mm-dd
  avatar?: string;
};

function toDTO(p: any): ProfileDTO {
  return {
    fullName: p.fullName,
    email: p.email,
    phone: p.phone ?? "",
    location: p.location ?? "",
    occupation: p.occupation ?? "",
    birthDate: p.birthDate ? new Date(p.birthDate).toISOString().slice(0, 10) : "",
    avatar: p.avatarUrl ?? undefined,
  };
}

export async function getMyProfile(): Promise<{ ok: true; data: ProfileDTO } | { ok: false; error: string }>{
  try {
    const user = await me();
    if (!user) return { ok: false, error: "Not authenticated" };

    const p = await prisma.profile.findUnique({ where: { id: user.id } });
    if (!p) {
      // Not an error: just no profile yet; return from user basics
      return {
        ok: true,
        data: {
          fullName: user.name || "",
          email: user.email as string,
          phone: "",
          location: "",
          occupation: "",
          birthDate: "",
          avatar: user.image || undefined,
        },
      };
    }
    return { ok: true, data: toDTO(p) };
  } catch (e: any) {
    console.error(e);
    return { ok: false, error: "Failed to load profile" };
  }
}

export async function upsertMyProfile(values: UpsertProfileInput): Promise<{ ok: true; data: ProfileDTO } | { ok: false; error: string }>{
  try {
    const user = await me();
    if (!user) return { ok: false, error: "Not authenticated" };

    const birthDate = values.birthDate ? new Date(values.birthDate) : null;

	  const res = await prisma.profile.upsert({
		  where: { id: user.id },
		  update: {
			  fullName: values.fullName,
			  email: (user.email as string) || values.email || "",
			  phone: values.phone ?? null,
			  location: values.location ?? null,
			  occupation: values.occupation ?? null,
			  birthDate: birthDate,
			  avatarUrl: values.avatar ?? null,
		  },
		  create: {
			  id: user.id,
			  fullName: values.fullName,
			  email: (user.email as string) || values.email || "",
			  phone: values.phone ?? null,
			  location: values.location ?? null,
			  occupation: values.occupation ?? null,
			  birthDate: birthDate,
			  avatarUrl: values.avatar ?? null,
		  },
	  });


    return { ok: true, data: toDTO(res) };
  } catch (e: any) {
    console.error(e);
    return { ok: false, error: "Failed to save profile" };
  }
}
