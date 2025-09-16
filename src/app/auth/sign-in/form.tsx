"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import React from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {SignInSchema} from "@/src/app/auth/sign-in/validate";
import Link from "next/link";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {signIn} from "@/lib/auth-client";
import {toast} from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm({className, ...props}: React.ComponentProps<"div">) {
	const [isPending, startTransition] = React.useTransition();
	const router = useRouter();

	const form = useForm({
		resolver: zodResolver(SignInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	})

	function onSubmit(values: any) {
		startTransition(async () => {
			const response = await signIn.email({
				email: values.email,
				password: values.password,
			})

			if(response?.error) {
				console.log(response.error.message)
				toast.error(JSON.stringify(response.error.message))
			} else {
				router.push("/admin")
				toast.success("Logged in successfully")
			}
		})
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<div className="flex flex-col gap-6">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="email"
													placeholder="m@example.com"
													required
												/>
											</FormControl>
											<FormMessage/>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<div className="flex items-center">
												<FormLabel htmlFor="password">Password</FormLabel>
												<Link
													href="/auth/forgot-password"
													className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
												>
													Forgot your password?
												</Link>
											</div>
											<FormControl>
												<Input
													{...field}
													type="password"
													required
												/>
											</FormControl>
											<FormMessage/>
										</FormItem>
									)}
								/>

								<div className="flex flex-col gap-3">
									<Button type="submit" className="w-full">
										Login
									</Button>
								</div>
							</div>
							<div className="mt-4 text-center text-sm">
								Don&apos;t have an account?{" "}
								<Link href="/auth/sign-up" className="underline underline-offset-4">
									Sign up
								</Link>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
