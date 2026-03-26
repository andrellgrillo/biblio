import { auth } from "@/lib/auth";
import {
  BookCopy,
  ArrowLeftRight,
  CalendarClock,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Painel Administrativo" };

export default async function AdminDashboard() {
  const session = await auth();

  let stats = { books: 0, copies: 0, activeLoans: 0, overdueLoans: 0, users: 0, pendingReservations: 0 };

  try {
    const [books, copies, activeLoans, overdueLoans, users, pendingReservations] =
      await Promise.all([
        prisma.book.count(),
        prisma.copy.count(),
        prisma.loan.count({ where: { status: "ACTIVE" } }),
        prisma.loan.count({
          where: { status: "ACTIVE", dueDate: { lt: new Date() } },
        }),
        prisma.user.count({ where: { role: "READER" } }),
        prisma.reservation.count({ where: { status: "PENDING" } }),
      ]);
    stats = { books, copies, activeLoans, overdueLoans, users, pendingReservations };
  } catch {
    // DB not available yet
  }

  const cards = [
    {
      label: "Livros no Acervo",
      value: stats.books,
      icon: <BookCopy className="h-5 w-5" />,
      href: "/admin/books",
      color: "text-gold-400",
      bg: "bg-gold-400/10",
    },
    {
      label: "Empréstimos Ativos",
      value: stats.activeLoans,
      icon: <ArrowLeftRight className="h-5 w-5" />,
      href: "/admin/loans",
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      label: "Atrasados",
      value: stats.overdueLoans,
      icon: <AlertTriangle className="h-5 w-5" />,
      href: "/admin/loans",
      color: "text-error",
      bg: "bg-error/10",
    },
    {
      label: "Reservas Pendentes",
      value: stats.pendingReservations,
      icon: <CalendarClock className="h-5 w-5" />,
      href: "/admin/reservations",
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Leitores",
      value: stats.users,
      icon: <Users className="h-5 w-5" />,
      href: "/admin/users",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Exemplares",
      value: stats.copies,
      icon: <TrendingUp className="h-5 w-5" />,
      href: "/admin/books",
      color: "text-gold-300",
      bg: "bg-gold-300/10",
    },
  ];

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-display)]">
          Painel <span className="text-gradient-gold">Administrativo</span>
        </h1>
        <p className="mt-1 text-text-secondary">
          Bem-vindo, <span className="text-gold-300">{session?.user?.name}</span>. Aqui está o resumo da biblioteca.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="glass-card p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-text-primary">
                  {card.value}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {stats.overdueLoans > 0 && (
        <div className="mt-6 rounded-xl border border-error/30 bg-error/5 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-error shrink-0" />
          <div>
            <p className="font-medium text-error">
              {stats.overdueLoans} empréstimo{stats.overdueLoans > 1 ? "s" : ""} atrasado{stats.overdueLoans > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-text-muted">
              Acesse a seção de empréstimos para verificar os detalhes.
            </p>
          </div>
          <Link href="/admin/loans" className="btn-danger ml-auto text-sm">
            Ver Atrasados
          </Link>
        </div>
      )}
    </div>
  );
}
