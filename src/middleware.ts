import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import {apiRoute, authRoute, protectedRoute} from "@/src/routes";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

	const isAdminRoute = request.nextUrl.pathname.startsWith(protectedRoute);
	const isApiAuth = request.nextUrl.pathname.startsWith(apiRoute);
	const isAuthRoute = request.nextUrl.pathname.startsWith(authRoute);

	if(isAdminRoute && !sessionCookie) {
		return NextResponse.redirect(new URL("/auth/sign-in", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
