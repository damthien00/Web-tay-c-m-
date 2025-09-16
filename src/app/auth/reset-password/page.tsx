"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPasswordAction } from "@/actions/auth/password";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type TResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <Card>
              <CardHeader>
                <CardTitle>Reset your password</CardTitle>
                <CardDescription>Loading...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </React.Suspense>
  );
}

function ResetPasswordContent() {
  const [isPending, startTransition] = React.useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") || "";

  const form = useForm<TResetPasswordSchema>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = (values: TResetPasswordSchema) => {
    if (!token) {
      toast.error("Missing or invalid reset token");
      return;
    }
    startTransition(async () => {
      const res = await resetPasswordAction(token, values.password);
      if (!res.ok) {
        console.log(res.error);
        toast.error(res.error || "Failed to reset password");
        return;
      }
      toast.success("Password has been reset. Please sign in.");
      router.push("/auth/sign-in");
    });
  };

  return (
	  <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
		  <div className="w-full max-w-sm">
		    <Card>
			    <CardHeader>
				    <CardTitle>Reset your password</CardTitle>
				    <CardDescription>Enter a new password for your account.</CardDescription>
			    </CardHeader>
			    <CardContent>
				    {!token ? (
					    <div className="space-y-4">
						    <p className="text-sm text-destructive">Invalid or missing reset token.</p>
						    <div className="text-sm">
							    <Link href="/auth/forgot-password" className="underline underline-offset-4">Request a new link</Link>
						    </div>
					    </div>
				    ) : (
					    <Form {...form}>
						    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							    <FormField
								    control={form.control}
								    name="password"
								    render={({ field }) => (
									    <FormItem>
										    <FormLabel>New Password</FormLabel>
										    <FormControl>
											    <Input {...field} type="password" required />
										    </FormControl>
										    <FormMessage />
									    </FormItem>
								    )}
							    />
							    <FormField
								    control={form.control}
								    name="confirmPassword"
								    render={({ field }) => (
									    <FormItem>
										    <FormLabel>Confirm Password</FormLabel>
										    <FormControl>
											    <Input {...field} type="password" required />
										    </FormControl>
										    <FormMessage />
									    </FormItem>
								    )}
							    />
							    <Button type="submit" className="w-full" disabled={isPending}>
								    {isPending ? "Resetting..." : "Reset Password"}
							    </Button>
							    <div className="text-center text-sm">
								    <Link href="/auth/sign-in" className="underline underline-offset-4">Back to sign in</Link>
							    </div>
						    </form>
					    </Form>
				    )}
			    </CardContent>
		    </Card>
	    </div>
    </div>
  );
}
