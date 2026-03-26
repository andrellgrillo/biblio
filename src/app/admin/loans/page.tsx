import { prisma } from "@/lib/prisma";
import { CreateLoanForm, LoanList } from "./LoanComponents";

export const metadata = { title: "Gerenciar Empréstimos" };

export default async function AdminLoansPage() {
  let loans: {
    id: string;
    loanDate: Date;
    dueDate: Date;
    returnDate: Date | null;
    status: string;
    user: { name: string; email: string };
    copy: { code: string; book: { title: string; author: string } };
  }[] = [];

  try {
    loans = await prisma.loan.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        copy: {
          select: {
            code: true,
            book: { select: { title: true, author: true } },
          },
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
            Gerenciar <span className="text-gradient-gold">Empréstimos</span>
          </h1>
          <p className="mt-1 text-text-secondary">
            Registre empréstimos, devoluções e acompanhe prazos
          </p>
        </div>
        <CreateLoanForm />
      </div>

      <LoanList loans={loans} />
    </div>
  );
}
