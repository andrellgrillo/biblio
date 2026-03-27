"use client";

import { useState } from "react";
import { createLoan, returnLoan } from "@/actions/loans";
import {
  Plus,
  RotateCcw,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  Bell,
} from "lucide-react";

type Loan = {
  id: string;
  loanDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: string;
  user: { name: string; email: string };
  copy: { code: string; book: { title: string; author: string } };
};

export function CreateLoanForm() {
  const [open, setOpen] = useState(false);
  const [copyCode, setCopyCode] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loanDays, setLoanDays] = useState(14);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const result = await createLoan(copyCode, userEmail, loanDays);
    if (result?.error) {
      setMsg({ text: result.error, type: "error" });
    } else {
      setMsg({ text: result.message!, type: "success" });
      setCopyCode("");
      setUserEmail("");
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="h-4 w-4" /> Novo Empréstimo
      </button>
    );
  }

  return (
    <div className="glass-card p-6 mb-6 !transform-none print:hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Registrar Empréstimo</h3>
        <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary">
          <X className="h-5 w-5" />
        </button>
      </div>

      {msg && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
            msg.type === "success"
              ? "bg-success/10 border border-success/20 text-success"
              : "bg-error/10 border border-error/20 text-error"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex-[2] min-w-[150px]">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Código do Exemplar
          </label>
          <input
            value={copyCode}
            onChange={(e) => setCopyCode(e.target.value)}
            placeholder="Ex: BIB-001"
            required
            className="input-field"
          />
        </div>
        <div className="flex-[2] min-w-[200px]">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            E-mail do Leitor
          </label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="leitor@email.com"
            required
            className="input-field"
          />
        </div>
        <div className="flex-1 min-w-[70px]">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Dias
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={loanDays}
            onChange={(e) => setLoanDays(parseInt(e.target.value) || 14)}
            required
            className="input-field px-2"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary !py-2.5 w-full sm:w-auto mt-4 sm:mt-0">
          {loading ? "Processando..." : "Emprestar"}
        </button>
      </form>
    </div>
  );
}

export function LoanList({ loans }: { loans: Loan[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "returned" | "overdue">("all");

  const now = new Date();

  const filtered = loans.filter((loan) => {
    const matchSearch =
      loan.user.name.toLowerCase().includes(search.toLowerCase()) ||
      loan.user.email.toLowerCase().includes(search.toLowerCase()) ||
      loan.copy.code.toLowerCase().includes(search.toLowerCase()) ||
      loan.copy.book.title.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (filter === "active") return loan.status === "ACTIVE" && new Date(loan.dueDate) >= now;
    if (filter === "returned") return loan.status === "RETURNED";
    if (filter === "overdue") return loan.status === "ACTIVE" && new Date(loan.dueDate) < now;
    return true;
  });

  const handleReturn = async (loanId: string) => {
    if (!confirm("Confirmar devolução?")) return;
    const result = await returnLoan(loanId);
    if (result?.error) alert(result.error);
  };

  const handleNotifyOverdue = () => {
    alert(`Notificações (simuladas) enviadas para ${filtered.length} leitor(es) com e-mail de cobrança!`);
  };

  return (
    <div>
      {filter === "overdue" && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 bg-error/10 border border-error/20 p-4 rounded-xl gap-4 print:hidden">
          <p className="text-sm font-medium text-error flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {filtered.length} empréstimo(s) em atraso
          </p>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-secondary !py-1.5 !px-3 text-xs bg-bg-surface">
              <Printer className="h-3.5 w-3.5 mr-1" /> PDF / Imprimir
            </button>
            <button onClick={handleNotifyOverdue} className="btn-danger !py-1.5 !px-3 text-xs">
              <Bell className="h-3.5 w-3.5 mr-1" /> Notificar Todos
            </button>
          </div>
        </div>
      )}

      {/* Print-only title */}
      <h2 className="hidden print:block text-2xl font-bold mb-6 text-center text-text-primary">
        Relatório de Leitores Inadimplentes (Atrasados)
      </h2>

      <div className="flex items-center gap-4 mb-6 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por leitor, código ou livro..."
            className="input-field !pl-10"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "overdue", "returned"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? "bg-gold-400/15 text-gold-300 border border-gold-400/20"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-hover border border-transparent"
              }`}
            >
              {{ all: "Todos", active: "Ativos", overdue: "Atrasados", returned: "Devolvidos" }[f]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center !transform-none">
          <p className="text-text-muted">Nenhum empréstimo encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((loan) => {
            const isOverdue = loan.status === "ACTIVE" && new Date(loan.dueDate) < now;
            return (
              <div key={loan.id} className="glass-card p-4 !transform-none">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {loan.copy.book.title}
                      </h3>
                      <span
                        className={`badge text-[0.6rem] ${
                          loan.status === "RETURNED"
                            ? "badge-success"
                            : isOverdue
                            ? "badge-error"
                            : "badge-info"
                        }`}
                      >
                        {loan.status === "RETURNED"
                          ? "Devolvido"
                          : isOverdue
                          ? "Atrasado"
                          : "Ativo"}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      <span className="font-medium text-text-secondary">{loan.user.name}</span>
                      {" · "}{loan.copy.code}
                      {" · "}Emprestado em {new Date(loan.loanDate).toLocaleDateString("pt-BR")}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                      <Clock className="h-3 w-3" />
                      {loan.status === "RETURNED"
                        ? `Devolvido em ${new Date(loan.returnDate!).toLocaleDateString("pt-BR")}`
                        : `Prazo: ${new Date(loan.dueDate).toLocaleDateString("pt-BR")}`}
                    </div>
                  </div>
                  <div className="text-right print:hidden">
                    {loan.status === "ACTIVE" && (
                      <button
                        onClick={() => handleReturn(loan.id)}
                        className="btn-secondary !py-1.5 !px-3 text-xs ml-4"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Devolver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
