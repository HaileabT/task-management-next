import { $Enums } from "@/generated/prisma";
import { z } from "zod";

type StatusType = $Enums.TaskStatus;
const validTaskStatus: StatusType[] | string[] = [
  "PENDING",
  "DONE",
  "FAILED",
  "IN_PROGRESS",
];

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(5000, "Descripton too long.").optional(),
  categories: z.array(z.string()).optional().default(["General"]),
});

export const updateTaskSchema = z.object({
  title: z.string().max(200, "Title too long.").optional(),
  description: z.string().max(5000, "Descripton too long.").optional(),
  categories: z.array(z.string()).optional().default(["General"]),
  status: z.enum(validTaskStatus).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
