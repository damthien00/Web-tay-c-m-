"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordResetAction } from "@/actions/auth/password";
import { toast } from "sonner";
import Link from "next/link";

const ForgotPasswordSchema = z.object({
  email: z.email(),
});

type TForgotPasswordSchema = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = React.useTransition();
  const [sent, setSent] = React.useState(false);

  const form = useForm<TForgotPasswordSchema>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: TForgotPasswordSchema) => {
    startTransition(async () => {
      const res = await requestPasswordResetAction(values.email);
      if (!res.ok) {
        console.log(res.error);
        toast.error(res.error || "Failed to request password reset");
        return;
      }
      setSent(true);
      toast.success("If that email exists, we sent a reset link.");
    });
  };

  return (
	  <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
		  <div className="w-full max-w-sm">
	      <Card>
	        <CardHeader>
	          <CardTitle>Forgot your password?</CardTitle>
	          <CardDescription>Enter your email and we\'ll send you a link to reset your password.</CardDescription>
	        </CardHeader>
	        <CardContent>
	          {sent ? (
	            <div className="space-y-4">
	              <p className="text-sm text-muted-foreground">
	                If an account with that email exists, a reset link has been sent. Please check your inbox.
	              </p>
	              <div className="text-sm">
	                <Link href="/auth/sign-in" className="underline underline-offset-4">Back to sign in</Link>
	              </div>
	            </div>
	          ) : (
	            <Form {...form}>
	              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
	                <FormField
	                  control={form.control}
	                  name="email"
	                  render={({ field }) => (
	                    <FormItem>
	                      <FormLabel>Email</FormLabel>
	                      <FormControl>
	                        <Input {...field} type="email" placeholder="m@example.com" required />
	                      </FormControl>
	                      <FormMessage />
	                    </FormItem>
	                  )}
	                />
	                <Button type="submit" className="w-full" disabled={isPending}>
	                  {isPending ? "Sending..." : "Send reset link"}
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
