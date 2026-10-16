"use server";

import { Products } from "@prisma/client";
import { getErrorMessage } from "@/actions/utils/utils";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { productCreateSchema, productUpdateSchema, TProductCreateSchema, TProductUpdateSchema } from "./validations";

// Tạo sản phẩm
export async function createProduct(inputs: TProductCreateSchema) {
    try {
        const values = productCreateSchema.parse(inputs);

        if (!values.images.length) {
            return { data: null, error: "Vui lòng chọn ít nhất một ảnh." };
        }

        const data = await prisma.products.create({
            data: {
                name: values.name.trim(),
                price: values.price,
                oldPrice: values.oldPrice ?? null,
                image: values.images[0],
                images: values.images,
                rating: values.rating ?? 0,
                sold: values.sold ?? 0,
                description: values.description ?? "",
            },
        });

        revalidatePath("/");
        revalidatePath("/products");
        revalidatePath("/admin/products");

        return { data, error: null };
    } catch (error) {
        return { data: null, error: getErrorMessage(error) };
    }
}

// Cập nhật sản phẩm
export async function updateProduct(
    id: string,
    inputs: TProductUpdateSchema
) {
    try {
        const values = productUpdateSchema.parse(inputs);

        const dataToUpdate: {
            name?: string;
            price?: number;
            oldPrice?: number | null;
            image?: string;
            images?: string[];
            rating?: number;
            sold?: number;
            description?: string;
        } = {};

        if (values.name !== undefined) {
            dataToUpdate.name = values.name.trim();
        }

        if (values.price !== undefined) {
            dataToUpdate.price = values.price;
        }

        if (values.oldPrice !== undefined) {
            dataToUpdate.oldPrice = values.oldPrice;
        }

        if (values.images !== undefined) {
            if (values.images.length === 0) {
                return {
                    data: null,
                    error: "Sản phẩm phải có ít nhất một ảnh.",
                };
            }

            dataToUpdate.images = values.images;
            dataToUpdate.image = values.images[0];
        } else if (values.image !== undefined) {
            dataToUpdate.image = values.image;
        }

        if (values.rating !== undefined) {
            dataToUpdate.rating = values.rating;
        }

        if (values.sold !== undefined) {
            dataToUpdate.sold = values.sold;
        }
        if (values.sold !== undefined) {
                    dataToUpdate.sold = values.sold;
                }

          if (values.description !== undefined) {
            dataToUpdate.description = values.description.trim();
        }
        const data = await prisma.products.update({
            where: { id },
            data: dataToUpdate,
        });

        revalidatePath("/");
        revalidatePath("/products");
        revalidatePath(`/admin/products/${id}`);
        revalidatePath("/admin/products");

        return { data, error: null };
    } catch (error) {
        return { data: null, error: getErrorMessage(error) };
    }
}

// Xóa nhiều sản phẩm
export const deleteProducts = async (ids: string[]) => {
  try {
    if (ids.length === 0) {
      return {
        data: null,
        error: "Vui lòng chọn ít nhất một sản phẩm cần xóa",
      };
    }

    const res = await prisma.products.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      data: res,
      error: null,
    };
  } catch (e) {
    console.error("deleteProducts error:", e);

    return {
      data: null,
      error: getErrorMessage(e),
    };
  }
};

// Xóa một sản phẩm
export const deleteProduct = async (id: string) => {
  try {
    const res = await prisma.products.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath(`/products/${id}`);

    return {
      data: res,
      error: null,
    };
  } catch (e) {
    console.error("deleteProduct error:", e);

    return {
      data: null,
      error: getErrorMessage(e),
    };
  }
};