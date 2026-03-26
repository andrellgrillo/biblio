import { prisma } from "@/lib/prisma";
import { CreateBookForm, BookList } from "./BookComponents";

export const metadata = { title: "Gerenciar Livros" };

export default async function AdminBooksPage() {
  let books: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    genre: string | null;
    publishedYear: number | null;
    copies: { id: string; code: string; status: string; condition: string }[];
  }[] = [];

  try {
    books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        copies: {
          select: { id: true, code: true, status: true, condition: true },
          orderBy: { code: "asc" },
        },
      },
    });
  } catch {
    // DB not available
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-display)]">
            Gerenciar <span className="text-gradient-gold">Livros</span>
          </h1>
          <p className="mt-1 text-text-secondary">
            Cadastre, edite e gerencie o acervo da biblioteca
          </p>
        </div>
        <CreateBookForm />
      </div>

      <BookList books={books} />
    </div>
  );
}
