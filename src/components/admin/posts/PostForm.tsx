"use client";

import React, { useMemo, useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
	TPostWithRelations,
	postCreateSchema,
	TPostCreateSchema,
	defaultPost,
	postUpdateSchema
} from "@/actions/posts/validations";
import { createPost, updatePost } from "@/actions/posts/actions";
import { useRouter } from "next/navigation";
import {zodResolver} from "@hookform/resolvers/zod";
import QuillEditor from "@/components/quill/QuillEditor";
import {toast} from "sonner";
import {TPostCategory} from "@/actions/post-categories/validations";
import {MultiSelect} from "@/components/ui/multi-select";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

type PostFormProps = {
  post?: TPostWithRelations | null;
  postCategories: TPostCategory[];
};

export default function PostForm({ post, postCategories }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = useMemo(() => !!post?.id, [post?.id]);
	const parsedPost = useMemo(() => postCreateSchema.safeParse(post), [post]);

  const form = useForm({
	  resolver: zodResolver(postCreateSchema),
    defaultValues: isEdit ? {
			...defaultPost,
			...parsedPost.data,
    } : defaultPost,
  });

  const onSubmit = (values: TPostCreateSchema) => {
    startTransition(async () => {
      try {
        if (isEdit && post?.id) {
          const res = await updatePost(post.id, {
						...postUpdateSchema.parse(values),
          });
	        if (res.error) {
		        console.log(res.error);
		        toast.error(JSON.stringify(res.error));
		        return;
	        }
					toast.success("Post updated successfully");
        } else {
          const res = await createPost({
	          ...postCreateSchema.parse(values),
          });
          if (res.error) {
						console.log(res.error);
						toast.error(JSON.stringify(res.error));
            return;
          }

					toast.success("Post created successfully");
          if (res.data?.id) {
            router.push(`/admin/posts/${res.data.id}`);
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
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter post title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
	        control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <QuillEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Write content..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
	        control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={Boolean(field.value)} onCheckedChange={field.onChange} id="published" />
              </FormControl>
              <FormLabel className="text-sm font-normal">Published</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
	        control={form.control}
          name="categoryIDs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
	              <MultiSelect
		              options={postCategories.map((pc) => ({
			              label: pc.name,
			              value: pc.id,
		              }))}
		              onValueChange={(e) => {
			              field.onChange(e)
			              if(e.length > 0 && e.includes(form.watch('mainCategoryId') || "")) {
				              form.setValue('mainCategoryId', "none")
			              } else {
											form.setValue('mainCategoryId', "none")
			              }
		              }}
		              defaultValue={field.value}
	              />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

	      {((form.watch('categoryIDs') || [])?.length > 0) && (
		      <FormField
			      control={form.control}
			      name="mainCategoryId"
			      render={({ field }) => (
				      <FormItem>
					      <FormLabel>Main Category</FormLabel>
					      <FormControl>
						      <Select
							      value={field.value || "none"}
							      onValueChange={field.onChange}
						      >
							      <SelectTrigger className="w-[180px]">
								      <SelectValue placeholder="Select a Category" />
							      </SelectTrigger>
							      <SelectContent>
								      <SelectGroup>
									      <SelectItem value="none">Select a Category</SelectItem>
									      {postCategories.filter(i => form.watch('categoryIDs')?.includes(i.id)).map((pc) => (
										      <SelectItem key={pc.id} value={pc.id}>{pc.name}</SelectItem>
									      ))}
								      </SelectGroup>
							      </SelectContent>
						      </Select>
					      </FormControl>
					      <FormMessage />
				      </FormItem>
			      )}
		      />
	      )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Post")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
