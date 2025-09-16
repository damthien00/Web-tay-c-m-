"use client";

import React, { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import {
  TUserWithRelations,
  userCreateSchema,
  TUserCreateSchema,
  defaultUser,
  userUpdateSchema,
} from "@/actions/users/validations";
import { createUser, updateUser } from "@/actions/users/actions";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Role } from "@prisma/client";


type UserFormProps = {
  user?: TUserWithRelations | null;
};

export default function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = useMemo(() => !!user?.id, [user?.id]);
  const parsedUser = useMemo(() => userCreateSchema.safeParse(user), [user]);

  const form = useForm({
    resolver: zodResolver(userCreateSchema),
    defaultValues: isEdit
      ? {
          ...defaultUser,
          ...parsedUser.data,
        }
      : defaultUser,
  });

  const onSubmit = (values: TUserCreateSchema) => {
    startTransition(async () => {
      try {
        if (isEdit && user?.id) {
          const res = await updateUser(user.id, {
            ...userUpdateSchema.parse(values),
          });
          if (res.error) {
            console.log(res.error);
            toast.error(JSON.stringify(res.error));
            return;
          }
          toast.success("User updated successfully");
        } else {
          const res = await createUser({
            ...userCreateSchema.parse(values),
          });
          if (res.error) {
            console.log(res.error);
            toast.error(JSON.stringify(res.error));
            return;
          }
          toast.success("User created successfully");
          if (res.data?.id) {
            router.push(`/admin/users/${res.data.id}`);
            return;
          }
        }
      } catch (err: any) {
        console.log(err);
        toast.error(JSON.stringify(err));
      }
    });
  };

  return (
    <Form {...form}>
	    {/*<div>{JSON.stringify(user)}</div>*/}
	    {/*<div>{JSON.stringify(parsedUser)}</div>*/}
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6 max-w-3xl">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
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
                <Input type="email" placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select value={field.value || "USER"} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Role</SelectLabel>
                      {Object.keys(Role).map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emailVerified"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={Boolean(field.value)} onCheckedChange={field.onChange} id="emailVerified" />
              </FormControl>
              <FormLabel className="text-sm font-normal">Email Verified</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create User")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
