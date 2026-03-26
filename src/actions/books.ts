"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CopyCondition } from "@/generated/prisma/client";

const BookSchema = z.object({
  title: z.string().min(1, "Título é obrigatório."),
  author: z.string().min(1, "Autor é obrigatório."),
  isbn: z.string().min(1, "ISBN é obrigatório."),
  genre: z.string().optional(),
  synopsis: z.string().optional(),
  coverUrl: z.string().url("URL inválida.").optional().or(z.literal("")),
  publishedYear: z.coerce
    .number()
    .int()
    .min(1000)
    .max(new Date().getFullYear() + 1)
    .optional()
    .or(z.literal("")),
});

export type BookFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | undefined;

export async function createBook(
  _prevState: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  const session = await auth();
  if (session?.user?.role !== "LIBRARIAN") {
    return { message: "Acesso negado." };
  }

  const raw = {
    title: formData.get("title"),
    author: formData.get("author"),
    isbn: formData.get("isbn"),
    genre: formData.get("genre") || undefined,
    synopsis: formData.get("synopsis") || undefined,
    coverUrl: formData.get("coverUrl") || undefined,
    publishedYear: formData.get("publishedYear") || undefined,
  };

  const validated = BookSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { title, author, isbn, genre, synopsis, coverUrl, publishedYear } =
    validated.data;

  const existingBook = await prisma.book.findUnique({ where: { isbn } });
  if (existingBook) {
    return { message: "Já existe um livro com este ISBN." };
  }

  await prisma.book.create({
    data: {
      title,
      author,
      isbn,
      genre: genre || null,
      synopsis: synopsis || null,
      coverUrl: coverUrl || null,
      publishedYear: publishedYear ? Number(publishedYear) : null,
    },
  });

  revalidatePath("/admin/books");
  revalidatePath("/");
  return { success: true, message: "Livro cadastrado com sucesso!" };
}

export async function deleteBook(bookId: string) {
  const session = await auth();
  if (session?.user?.role !== "LIBRARIAN") return;

  await prisma.book.delete({ where: { id: bookId } });
  revalidatePath("/admin/books");
  revalidatePath("/");
}

export async function addCopy(bookId: string, code: string, condition: string) {
  const session = await auth();
  if (session?.user?.role !== "LIBRARIAN") return { error: "Acesso negado." };

  if (!code.trim()) return { error: "Código do exemplar é obrigatório." };

  const existing = await prisma.copy.findUnique({ where: { code } });
  if (existing) return { error: "Já existe um exemplar com este código." };

  await prisma.copy.create({
    data: {
      code,
      bookId,
      condition: (condition as CopyCondition) || "NEW",
    },
  });

  revalidatePath("/admin/books");
  revalidatePath("/");
  return { success: true };
}

export async function removeCopy(copyId: string) {
  const session = await auth();
  if (session?.user?.role !== "LIBRARIAN") return;

  await prisma.copy.delete({ where: { id: copyId } });
  revalidatePath("/admin/books");
  revalidatePath("/");
}
