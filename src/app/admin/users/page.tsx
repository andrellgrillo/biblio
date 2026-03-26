import { prisma } from "@/lib/prisma";
import { Users, Shield, BookOpen } from "lucide-react";

export const metadata = { title: "Gerenciar Usuários" };

export default async function AdminUsersPage() {
  let users: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    _count: { loans: number; reservations: number };
  }[] = [];

  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { loans: true, reservations: true } },
      },
    });
  } catch {
    // DB not available
  }

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-display)]">
          Gerenciar <span className="text-gradient-gold">Usuários</span>
        </h1>
        <p className="mt-1 text-text-secondary">
          Visualize todos os usuários cadastrados no sistema
        </p>
      </div>

      {users.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-text-muted/30 mb-3" />
          <p className="text-text-muted">Nenhum usuário cadastrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="glass-card p-4 !transform-none">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {user.name}
                    </h3>
                    <span
                      className={`badge text-[0.6rem] ${
                        user.role === "LIBRARIAN" ? "badge-gold" : "badge-info"
                      }`}
                    >
                      {user.role === "LIBRARIAN" ? (
                        <><Shield className="h-3 w-3 mr-0.5" /> Bibliotecário</>
                      ) : (
                        <><BookOpen className="h-3 w-3 mr-0.5" /> Leitor</>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {user.email} · Cadastro: {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted ml-4">
                  <span>{user._count.loans} empréstimos</span>
                  <span>{user._count.reservations} reservas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
