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
  let recentLoans: any[] = [];
  let recentReservations: any[] = [];

  try {
    const [counts, loans, res] = await Promise.all([
      Promise.all([
        prisma.book.count(),
        prisma.copy.count(),
        prisma.loan.count({ where: { status: "ACTIVE" } }),
        prisma.loan.count({
          where: { status: "ACTIVE", dueDate: { lt: new Date() } },
        }),
        prisma.user.count({ where: { role: "READER" } }),
        prisma.reservation.count({ where: { status: "PENDING" } }),
      ]),
      prisma.loan.findMany({
        take: 5,
        orderBy: { loanDate: "desc" },
        include: { user: true, copy: { include: { book: true } } },
      }),
      prisma.reservation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: true, book: true },
        where: { status: "PENDING" },
      }),
    ]);

    stats = {
      books: counts[0],
      copies: counts[1],
      activeLoans: counts[2],
      overdueLoans: counts[3],
      users: counts[4],
      pendingReservations: counts[5],
    };
    recentLoans = loans;
    recentReservations = res;
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
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
    <div className="fade-in pb-10">
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
        <div className="mt-6 rounded-xl border border-error/20 bg-error/5 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-error shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-error">
              {stats.overdueLoans} empréstimo{stats.overdueLoans > 1 ? "s" : ""} atrasado{stats.overdueLoans > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-text-muted">
              Acesse a seção de empréstimos para verificar os detalhes.
            </p>
          </div>
          <Link href="/admin/loans" className="btn-danger text-xs !py-2">
            Ver Detalhes
          </Link>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Loans */}
        <div className="glass-card p-6 !transform-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Empréstimos Recentes</h2>
            <Link href="/admin/loans" className="text-xs text-text-accent hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-4">
            {recentLoans.length > 0 ? (
              recentLoans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-surface/50 border border-border-subtle">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{loan.copy.book.title}</p>
                    <p className="text-xs text-text-muted truncate">{loan.user.name} · {loan.copy.code}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-[0.65rem] text-text-muted">
                      {new Date(loan.loanDate).toLocaleDateString("pt-BR")}
                    </p>
                    <span className={`text-[0.6rem] font-bold ${loan.status === "ACTIVE" ? "text-success" : "text-text-muted"}`}>
                      {loan.status === "ACTIVE" ? "ATIVO" : "FINALIZADO"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-text-muted py-8">Nenhuma atividade recente</p>
            )}
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="glass-card p-6 !transform-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Reservas Pendentes</h2>
            <Link href="/admin/reservations" className="text-xs text-text-accent hover:underline">Ver fila</Link>
          </div>
          <div className="space-y-4">
            {recentReservations.length > 0 ? (
              recentReservations.map((res) => (
                <div key={res.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-surface/50 border border-border-subtle">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{res.book.title}</p>
                    <p className="text-xs text-text-muted truncate">{res.user.name}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-[0.65rem] text-text-muted">
                      {new Date(res.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <span className="badge badge-warning text-[0.55rem]">PENDENTE</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-text-muted py-8">Nenhuma reserva na fila</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
