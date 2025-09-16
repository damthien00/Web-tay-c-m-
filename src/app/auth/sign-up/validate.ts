import { z } from "zod";

export const SignUpSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
