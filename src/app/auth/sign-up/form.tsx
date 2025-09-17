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
import {SignUpSchema} from "@/app/auth/sign-up/validate";
import Link from "next/link";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {signUp} from "@/lib/auth-client";
import {toast} from "sonner";
import { useRouter } from "next/navigation";

export function SignUpForm({className, ...props}: React.ComponentProps<"div">) {
	const [isPending, startTransition] = React.useTransition();
	const router = useRouter();

	const form = useForm({
		resolver: zodResolver(SignUpSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	})

	function onSubmit(values: any) {
		startTransition(async () => {
			const response = await signUp.email({
				email: values.email,
				password: values.password,
				name: values.name,
			})

			if(response?.error) {
				console.log(response.error.message)
				toast.error(JSON.stringify(response.error.message))
			} else {
				router.push("/admin")
				toast.success("Account created successfully")
			}
		})
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Create an account</CardTitle>
					<CardDescription>
						Enter your details below to create your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<div className="flex flex-col gap-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="John Doe"
													required
												/>
											</FormControl>
											<FormMessage/>
										</FormItem>
									)}
								/>

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
											<FormLabel htmlFor="password">Password</FormLabel>
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

								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
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
										Sign Up
									</Button>
								</div>
							</div>
							<div className="mt-4 text-center text-sm">
								Already have an account?{" "}
								<Link href="/auth/sign-in" className="underline underline-offset-4">
									Sign in
								</Link>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
