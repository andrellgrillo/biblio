import Link from "next/link";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import BookCard from "@/components/BookCard";
import { BookOpen, Search, ArrowRight, Library, Users, BookCopy } from "lucide-react";

export default async function HomePage() {
  let books: {
    id: string;
    title: string;
    author: string;
    coverUrl: string | null;
    genre: string | null;
    _count: { copies: number };
    copies: { status: string }[];
  }[] = [];

  try {
    books = await prisma.book.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { copies: true } },
        copies: { select: { status: true } },
      },
    });
  } catch {
    // Database not yet available
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/3 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <div className="slide-up">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-glow">
              <Library className="h-8 w-8 text-bg-deep" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-[var(--font-display)]">
              Bem-vindo ao{" "}
              <span className="text-gradient-gold">Biblio</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary leading-relaxed">
              Explore nosso acervo, faça empréstimos, reserve livros e acompanhe
              suas leituras — tudo em um só lugar.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="#catalog" className="btn-primary text-base !px-8 !py-3">
                <Search className="h-5 w-5" />
                Explorar Catálogo
              </Link>
              <Link href="/register" className="btn-secondary text-base !px-8 !py-3">
                Criar Conta Gratuita
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: <BookCopy className="h-6 w-6" />, label: "Livros no Acervo", value: "—" },
              { icon: <Users className="h-6 w-6" />, label: "Leitores Ativos", value: "—" },
              { icon: <BookOpen className="h-6 w-6" />, label: "Empréstimos Realizados", value: "—" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400/10 text-gold-400">
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Preview */}
      <section id="catalog" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)]">
                Últimas <span className="text-gradient-gold">Aquisições</span>
              </h2>
              <p className="mt-2 text-text-secondary">
                Os livros mais recentes do nosso acervo
              </p>
            </div>
          </div>

          {books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  coverUrl={book.coverUrl}
                  genre={book.genre}
                  totalCopies={book._count.copies}
                  availableCopies={
                    book.copies.filter((c) => c.status === "AVAILABLE").length
                  }
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-16 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-text-muted/30 mb-4" />
              <h3 className="text-lg font-semibold text-text-secondary">
                Nenhum livro cadastrado ainda
              </h3>
              <p className="mt-2 text-sm text-text-muted max-w-md mx-auto">
                O acervo será exibido aqui assim que o bibliotecário adicionar os
                primeiros livros ao sistema.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} Biblio — Sistema de Biblioteca
          </p>
        </div>
      </footer>
    </div>
  );
}
