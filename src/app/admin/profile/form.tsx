"use client"

import React, {useTransition} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {profileUpdateSchema, TProfileUpdateSchema} from "@/actions/profile/validations";
import {toast} from "sonner";
import {updateProfile} from "@/actions/profile/actions";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

export default function ProfileForm(props: {
	user: any
}) {
	const [isPending, startTransition] = useTransition();

	const form = useForm({
		resolver: zodResolver(profileUpdateSchema),
		defaultValues: {
			...props.user,
		}
	})

	const onSubmit = async (values: TProfileUpdateSchema) => {
		startTransition(async () => {
			try {
				const res = await updateProfile(values);
				if(res.error){
					console.log(res.error);
					toast.error(JSON.stringify(res.error));
					return;
				}

				toast.success("Profile updated successfully");
			} catch (err) {
				console.log(err);
				toast.error(JSON.stringify(err));
			}
		})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6 max-w-3xl">
				<div className={'grid grid-cols-2 gap-3'}>
					<div className="space-y-2">
						<FormLabel>Email</FormLabel>
						<Input value={props.user.email} disabled readOnly/>
					</div>

					<FormField
						control={form.control}
						name="name"
						disabled={isPending}
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Name
								</FormLabel>
								<FormControl>
									<Input placeholder="Enter name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="image"
					disabled={isPending}
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Avatar URL
							</FormLabel>
							<FormControl>
								<Input placeholder="https://..." {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex gap-3">
					<Button type="submit" disabled={isPending}>
						Save changes
					</Button>
				</div>
			</form>
		</Form>
	)
}
