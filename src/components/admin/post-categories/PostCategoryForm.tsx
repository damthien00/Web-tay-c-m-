"use client";

import React, { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { useRouter } from "next/navigation";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {
	defaultPostCategory,
	postCategoryCreateSchema,
	postCategoryUpdateSchema,
	TPostCategory, TPostCategoryCreateSchema
} from "@/actions/post-categories/validations";
import {createPostCategory, updatePostCategory} from "@/actions/post-categories/actions";

type FormProps = {
  data?: TPostCategory | null;
};

export default function PostCategoryForm({ data }: FormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = useMemo(() => !!data?.id, [data?.id]);
	const parsedData = useMemo(() => postCategoryCreateSchema.safeParse(data), [data]);

  const form = useForm({
	  resolver: zodResolver(postCategoryCreateSchema),
    defaultValues: isEdit ? {
			...defaultPostCategory,
			...parsedData.data,
    } : defaultPostCategory,
  });

  const onSubmit = (values: TPostCategoryCreateSchema) => {
    startTransition(async () => {
      try {
        if (isEdit && data?.id) {
          const res = await updatePostCategory(data.id, {
						...postCategoryUpdateSchema.parse(values),
          });
	        if (res.error) {
		        console.log(res.error);
		        toast.error(JSON.stringify(res.error));
		        return;
	        }
					toast.success("Post category updated successfully");
        } else {
          const res = await createPostCategory({
	          ...postCategoryCreateSchema.parse(values),
          });
          if (res.error) {
						console.log(res.error);
						toast.error(JSON.stringify(res.error));
            return;
          }

					toast.success("Post category created successfully");
          if (res.data?.id) {
            router.push(`/admin/post-categories/${res.data.id}`);
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

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
