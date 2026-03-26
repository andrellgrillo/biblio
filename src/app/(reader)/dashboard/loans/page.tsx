import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ArrowLeftRight, Clock, BookOpen } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Meus Empréstimos" };

export default async function ReaderLoansPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let loans: {
    id: string;
    loanDate: Date;
    dueDate: Date;
    returnDate: Date | null;
    status: string;
    copy: { code: string; book: { title: string; author: string } };
  }[] = [];

  try {
    if (userId) {
      loans = await prisma.loan.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          copy: {
            select: {
              code: true,
              book: { select: { title: true, author: true } },
            },
          },
        },
      });
    }
  } catch {
    // DB not available
  }

  const now = new Date();

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-display)]">
          Meus <span className="text-gradient-gold">Empréstimos</span>
        </h1>
        <p className="mt-1 text-text-secondary">
          Histórico completo de empréstimos e devoluções
        </p>
      </div>

      {loans.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ArrowLeftRight className="mx-auto h-12 w-12 text-text-muted/30 mb-3" />
          <p className="text-text-muted mb-2">Você ainda não fez nenhum empréstimo</p>
          <Link href="/" className="text-sm text-gold-400 hover:text-gold-300">
            Explorar catálogo →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => {
            const isOverdue = loan.status === "ACTIVE" && loan.dueDate < now;
            const daysLeft = Math.ceil(
              (loan.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            return (
              <div key={loan.id} className="glass-card p-4 !transform-none">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gold-400 shrink-0" />
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {loan.copy.book.title}
                      </h3>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 ml-6">
                      {loan.copy.book.author} · Código: {loan.copy.code}
                    </p>
                    <div className="flex items-center gap-1 mt-1 ml-6 text-xs text-text-muted">
                      <Clock className="h-3 w-3" />
                      {loan.status === "RETURNED"
                        ? `Devolvido em ${loan.returnDate!.toLocaleDateString("pt-BR")}`
                        : `Prazo: ${loan.dueDate.toLocaleDateString("pt-BR")}`}
                    </div>
                  </div>
                  <span
                    className={`badge text-[0.6rem] shrink-0 ml-2 ${
                      loan.status === "RETURNED"
                        ? "badge-success"
                        : isOverdue
                        ? "badge-error"
                        : daysLeft <= 3
                        ? "badge-warning"
                        : "badge-info"
                    }`}
                  >
                    {loan.status === "RETURNED"
                      ? "Devolvido"
                      : isOverdue
                      ? "Atrasado"
                      : `${daysLeft}d restantes`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
