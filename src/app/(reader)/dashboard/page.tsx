import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BookOpen,
  ArrowLeftRight,
  CalendarClock,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Meu Painel" };

export default async function ReaderDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  let activeLoans: any[] = [];
  let reservations: any[] = [];
  let popularBooks: any[] = [];

  try {
    if (userId) {
      [activeLoans, reservations, popularBooks] = await Promise.all([
        prisma.loan.findMany({
          where: { userId, status: "ACTIVE" },
          include: { copy: { include: { book: { select: { title: true, author: true } } } } },
          orderBy: { dueDate: "asc" },
          take: 5,
        }),
        prisma.reservation.findMany({
          where: { userId, status: { in: ["PENDING", "AWAITING_PICKUP"] } },
          include: { book: { select: { title: true, author: true } } },
          orderBy: { createdAt: "asc" },
          take: 5,
        }),
        prisma.book.findMany({
          take: 4,
          orderBy: { copies: { _count: "desc" } },
          select: { id: true, title: true, author: true, genre: true, coverUrl: true },
        }),
      ]);
    }
  } catch (error) {
    console.error("Reader dashboard load error:", error);
  }

  const now = new Date();

  return (
    <div className="fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-display)]">
          Olá, <span className="text-gradient-gold">{session?.user?.name}</span>
        </h1>
        <p className="mt-1 text-text-secondary">
          Acompanhe seus empréstimos e reservas
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeLoans.length}</p>
            <p className="text-sm text-text-muted">Empréstimos Ativos</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-warning">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{reservations.length}</p>
            <p className="text-sm text-text-muted">Reservas Ativas</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-error/10 text-error">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {activeLoans.filter((l) => new Date(l.dueDate) < now).length}
            </p>
            <p className="text-sm text-text-muted">Atrasados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Loans */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Meus Empréstimos</h2>
            <Link href="/dashboard/loans" className="text-sm text-text-accent hover:underline">
              Ver todos →
            </Link>
          </div>
          {activeLoans.length > 0 ? (
            <div className="space-y-3">
              {activeLoans.map((loan) => {
                const isOverdue = new Date(loan.dueDate) < now;
                const daysLeft = Math.ceil(
                  (new Date(loan.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={loan.id} className="glass-card p-4 !transform-none">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {loan.copy.book.title}
                        </p>
                        <p className="text-xs text-text-muted">{loan.copy.book.author}</p>
                      </div>
                      <span
                        className={`badge shrink-0 ml-2 ${
                          isOverdue ? "badge-error" : daysLeft <= 3 ? "badge-warning" : "badge-success"
                        }`}
                      >
                        {isOverdue ? "Atrasado" : `${daysLeft}d restantes`}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                      <Clock className="h-3 w-3" />
                      Devolver até {new Date(loan.dueDate).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-8 text-center !transform-none">
              <BookOpen className="mx-auto h-10 w-10 text-text-muted/30 mb-3" />
              <p className="text-sm text-text-muted">Nenhum empréstimo ativo</p>
              <Link href="/" className="text-sm text-text-accent hover:underline mt-2 inline-block">
                Explorar catálogo →
              </Link>
            </div>
          )}
        </div>

        {/* Reservations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Minhas Reservas</h2>
            <Link href="/dashboard/reservations" className="text-sm text-text-accent hover:underline">
              Ver todas →
            </Link>
          </div>
          {reservations.length > 0 ? (
            <div className="space-y-3">
              {reservations.map((res) => (
                <div key={res.id} className="glass-card p-4 !transform-none">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {res.book.title}
                      </p>
                      <p className="text-xs text-text-muted">{res.book.author}</p>
                    </div>
                    <span
                      className={`badge shrink-0 ml-2 ${
                        res.status === "AWAITING_PICKUP" ? "badge-success" : "badge-info"
                      }`}
                    >
                      {res.status === "AWAITING_PICKUP" ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Retirar</>
                      ) : (
                        `${res.position}º na fila`
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center !transform-none">
              <CalendarClock className="mx-auto h-10 w-10 text-text-muted/30 mb-3" />
              <p className="text-sm text-text-muted">Nenhuma reserva ativa</p>
            </div>
          )}
        </div>
      </div>

      {/* Popular Books */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Descobrir Livros Populares</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {popularBooks.map((book) => (
            <Link key={book.id} href="/" className="glass-card overflow-hidden group">
              <div className="aspect-[2/3] relative bg-bg-surface">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-text-muted/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-base to-transparent opacity-60" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[0.65rem] font-bold text-white truncate drop-shadow-md">{book.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
