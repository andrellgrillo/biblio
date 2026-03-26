import { prisma } from "@/lib/prisma";
import { cancelReservation } from "@/actions/loans";
import { CalendarClock, CheckCircle2, Clock, X } from "lucide-react";

export const metadata = { title: "Gerenciar Reservas" };

export default async function AdminReservationsPage() {
  let reservations: {
    id: string;
    status: string;
    position: number;
    createdAt: Date;
    user: { name: string; email: string };
    book: { title: string; author: string };
  }[] = [];

  try {
    reservations = await prisma.reservation.findMany({
      where: { status: { in: ["PENDING", "AWAITING_PICKUP"] } },
      orderBy: [{ bookId: "asc" }, { position: "asc" }],
      include: {
        user: { select: { name: true, email: true } },
        book: { select: { title: true, author: true } },
      },
    });
  } catch {
    // DB not available
  }

  const statusLabel: Record<string, string> = {
    PENDING: "Na fila",
    AWAITING_PICKUP: "Aguardando retirada",
  };

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-display)]">
          Gerenciar <span className="text-gradient-gold">Reservas</span>
        </h1>
        <p className="mt-1 text-text-secondary">
          Acompanhe filas de espera e reservas ativas
        </p>
      </div>

      {reservations.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CalendarClock className="mx-auto h-12 w-12 text-text-muted/30 mb-3" />
          <p className="text-text-muted">Nenhuma reserva ativa no momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => (
            <div key={res.id} className="glass-card p-4 !transform-none">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {res.book.title}
                    </h3>
                    <span
                      className={`badge text-[0.6rem] ${
                        res.status === "AWAITING_PICKUP" ? "badge-success" : "badge-info"
                      }`}
                    >
                      {res.status === "AWAITING_PICKUP" && (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      {statusLabel[res.status]}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    <span className="font-medium text-text-secondary">{res.user.name}</span>
                    {" · "}{res.user.email}
                    {" · "}Posição: {res.position}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                    <Clock className="h-3 w-3" />
                    Reservado em {new Date(res.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <form action={async () => { "use server"; await cancelReservation(res.id); }}>
                  <button type="submit" className="btn-danger !py-1.5 !px-3 text-xs ml-4">
                    <X className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
