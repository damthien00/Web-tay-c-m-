import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {sendResetPassword} from "@/lib/email/send-reset-password";

const prisma = new PrismaClient();
export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "mongodb",
	}),
	emailAndPassword: {
		enabled: true,
		sendResetPassword
	},
	socialProviders: {
		// github: {
		// 	clientId: process.env.GITHUB_CLIENT_ID as string,
		// 	clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
		// },
	},
});
