import Link from "next/link";
import { auth } from "@/lib/auth";
import { BookOpen, LogIn, UserPlus, LayoutDashboard, Shield } from "lucide-react";
import { Role } from "@/generated/prisma/client";

export default async function Navbar() {
  const session = await auth();
  const isAdmin = session?.user?.role === Role.LIBRARIAN;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-subtle"
      style={{ backgroundColor: "rgba(8, 11, 20, 0.85)", backdropFilter: "blur(16px)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 transition-shadow group-hover:shadow-glow">
              <BookOpen className="h-5 w-5 text-bg-deep" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gradient-gold font-[var(--font-display)]">Biblio</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            <Link href="/" className="px-3 py-2 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all">
              Catálogo
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {session?.user ? (
              <>
                <span className="hidden sm:block text-sm text-text-secondary mr-2">
                  Olá, <span className="text-gold-300 font-medium">{session.user.name}</span>
                </span>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="btn-secondary text-sm !py-2 !px-3"
                >
                  {isAdmin ? (
                    <><Shield className="h-4 w-4" /> Painel</>
                  ) : (
                    <><LayoutDashboard className="h-4 w-4" /> Dashboard</>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm !py-2 !px-3">
                  <LogIn className="h-4 w-4" /> Entrar
                </Link>
                <Link href="/register" className="btn-primary text-sm !py-2 !px-3">
                  <UserPlus className="h-4 w-4" /> Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
