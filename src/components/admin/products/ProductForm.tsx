"use client";

import React, { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { X, Upload, ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import {
    TProductCreateSchema,
    productCreateSchema,
    productUpdateSchema,
    defaultProduct,
} from "@/actions/products/validations";

import {
    createProduct,
    updateProduct,
} from "@/actions/products/actions";
import QuillEditor from "@/components/quill/QuillEditor";

type ProductFormProps = {
    product?: (TProductCreateSchema & { id: string }) | null;
};

export default function ProductForm({ product }: ProductFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);

    const isEdit = useMemo(() => Boolean(product?.id), [product?.id]);

    const initialImages = useMemo(() => {
        if (product?.images?.length) return product.images;
        if (product?.image) return [product.image];
        return [];
    }, [product]);

    const [images, setImages] = useState<string[]>(initialImages);

    const form = useForm<
        z.input<typeof productCreateSchema>,
        any,
        z.output<typeof productCreateSchema>
    >({
        resolver: zodResolver(productCreateSchema),
        defaultValues: {
            ...defaultProduct,
            ...product,
            image: initialImages[0] ?? "",
            images: initialImages,
            oldPrice: product?.oldPrice ?? null,
            rating: product?.rating ?? 0,
            sold: product?.sold ?? 0,
            description: product?.description ?? "",
        },
    });

    const uploadImages = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const selectedFiles = Array.from(files);

        if (images.length + selectedFiles.length > 10) {
            toast.error("Mỗi sản phẩm được tối đa 10 ảnh.");
            return;
        }

        for (const file of selectedFiles) {
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} không phải file ảnh.`);
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} vượt quá dung lượng 5 MB.`);
                return;
            }
        }

        const formData = new FormData();

        selectedFiles.forEach((file) => {
            formData.append("files", file);
        });

        setIsUploading(true);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.error ?? "Upload ảnh thất bại.");
            }

            const newImages = result.data as string[];
            const updatedImages = [...images, ...newImages];

            setImages(updatedImages);
            form.setValue("images", updatedImages, {
                shouldDirty: true,
                shouldValidate: true,
            });
            form.setValue("image", updatedImages[0] ?? "", {
                shouldDirty: true,
                shouldValidate: true,
            });

            toast.success(`Đã upload ${newImages.length} ảnh.`);
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error ? error.message : "Không thể upload ảnh."
            );
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);

        setImages(updatedImages);
        form.setValue("images", updatedImages, {
            shouldDirty: true,
            shouldValidate: true,
        });
        form.setValue("image", updatedImages[0] ?? "", {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const onSubmit = (values: TProductCreateSchema) => {
        if (isUploading) {
            toast.error("Vui lòng chờ upload ảnh hoàn tất.");
            return;
        }

        if (images.length === 0) {
            toast.error("Vui lòng upload ít nhất một ảnh sản phẩm.");
            return;
        }

        startTransition(async () => {
            try {
                const payload = {
                    ...values,
                    image: images[0],
                    images,
                };

                if (isEdit && product?.id) {
                    const validated = productUpdateSchema.parse(payload);
                    const res = await updateProduct(product.id, validated);

                    if (res.error) {
                        toast.error(
                            typeof res.error === "string"
                                ? res.error
                                : JSON.stringify(res.error)
                        );
                        return;
                    }

                    toast.success("Cập nhật sản phẩm thành công");
                    router.refresh();
                } else {
                    const validated = productCreateSchema.parse(payload);
                    const res = await createProduct(validated);

                    if (res.error) {
                        toast.error(
                            typeof res.error === "string"
                                ? res.error
                                : JSON.stringify(res.error)
                        );
                        return;
                    }

                    toast.success("Thêm sản phẩm thành công");

                    if (res.data?.id) {
                        router.push(`/admin/products/${res.data.id}`);
                    } else {
                        router.push("/admin/products");
                    }

                    router.refresh();
                }
            } catch (error) {
                console.error(error);
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi lưu sản phẩm."
                );
            }
        });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-6 max-w-3xl space-y-6"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên sản phẩm *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nhập tên sản phẩm"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá bán (VNĐ) *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={
                                            typeof field.value === "number"
                                                ? field.value
                                                : ""
                                        }
                                        onChange={(event) =>
                                            field.onChange(
                                                event.target.value === ""
                                                    ? ""
                                                    : Number(event.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="oldPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá gốc (VNĐ)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={1}
                                        placeholder="Không bắt buộc"
                                        value={
                                            typeof field.value === "number"
                                                ? field.value
                                                : ""
                                        }
                                        onChange={(event) =>
                                            field.onChange(
                                                event.target.value === ""
                                                    ? null
                                                    : Number(event.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Upload nhiều ảnh */}
                <FormItem>
                    <FormLabel>Ảnh sản phẩm *</FormLabel>

                    <div className="rounded-lg border border-dashed p-6">
                        <label
                            htmlFor="product-images"
                            className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center"
                        >
                            <div className="rounded-full bg-muted p-3">
                                <ImagePlus className="h-6 w-6" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    Chọn nhiều ảnh sản phẩm
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    JPG, PNG, WEBP hoặc GIF — tối đa 5 MB/ảnh,
                                    tối đa 10 ảnh
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                disabled={isUploading || images.length >= 10}
                                onClick={() =>
                                    document
                                        .getElementById("product-images")
                                        ?.click()
                                }
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {isUploading ? "Đang upload..." : "Chọn ảnh"}
                            </Button>
                        </label>

                        <input
                            id="product-images"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            className="hidden"
                            disabled={isUploading || images.length >= 10}
                            onChange={(event) => {
                                void uploadImages(event.target.files);
                                event.target.value = "";
                            }}
                        />
                    </div>

                    <FormDescription>
                        Ảnh đầu tiên sẽ được sử dụng làm ảnh đại diện sản phẩm.
                    </FormDescription>

                    {images.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 pt-3 sm:grid-cols-3 md:grid-cols-4">
                            {images.map((src, index) => (
                                <div
                                    key={`${src}-${index}`}
                                    className="relative overflow-hidden rounded-lg border"
                                >
                                    <div className="relative aspect-square">
                                        <Image
                                            src={src}
                                            alt={`Ảnh sản phẩm ${index + 1}`}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, 25vw"
                                        />
                                    </div>

                                    {index === 0 && (
                                        <span className="absolute bottom-0 left-0 right-0 bg-black/65 px-2 py-1 text-center text-xs text-white">
                                            Ảnh đại diện
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        aria-label={`Xóa ảnh ${index + 1}`}
                                        onClick={() => removeImage(index)}
                                        className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-red-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <FormMessage>
                        {form.formState.errors.images?.message}
                    </FormMessage>
                </FormItem>

                <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Đánh giá (0–5 sao)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    value={
                                        typeof field.value === "number"
                                            ? field.value
                                            : 0
                                    }
                                    onChange={(event) =>
                                        field.onChange(
                                            event.target.value === ""
                                                ? 0
                                                : Number(event.target.value)
                                        )
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="sold"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Số lượng đã bán</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={
                                        typeof field.value === "number"
                                            ? field.value
                                            : 0
                                    }
                                    onChange={(event) =>
                                        field.onChange(
                                            event.target.value === ""
                                                ? 0
                                                : Number(event.target.value)
                                        )
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                        control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <QuillEditor
                                   value={typeof field.value === "string" ? field.value : ""}
                                  onChange={field.onChange}
                                  placeholder="Write content..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                <Button
                    type="submit"
                    disabled={isPending || isUploading}
                >
                    {isUploading
                        ? "Đang upload ảnh..."
                        : isPending
                            ? "Đang lưu..."
                            : isEdit
                                ? "Lưu thay đổi"
                                : "Thêm sản phẩm"}
                </Button>
            </form>
        </Form>
    );
}