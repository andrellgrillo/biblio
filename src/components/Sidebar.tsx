"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import {
  BookOpen,
  LayoutDashboard,
  BookCopy,
  ArrowLeftRight,
  CalendarClock,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Library,
} from "lucide-react";
import { useState } from "react";

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Painel", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/admin/books", label: "Livros", icon: <BookCopy className="h-5 w-5" /> },
  { href: "/admin/loans", label: "Empréstimos", icon: <ArrowLeftRight className="h-5 w-5" /> },
  { href: "/admin/reservations", label: "Reservas", icon: <CalendarClock className="h-5 w-5" /> },
  { href: "/admin/users", label: "Usuários", icon: <Users className="h-5 w-5" /> },
];

const readerLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Meu Painel", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/dashboard/loans", label: "Meus Empréstimos", icon: <ArrowLeftRight className="h-5 w-5" /> },
  { href: "/dashboard/reservations", label: "Minhas Reservas", icon: <CalendarClock className="h-5 w-5" /> },
];

export default function Sidebar({ variant }: { variant: "admin" | "reader" }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const links = variant === "admin" ? adminLinks : readerLinks;

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border-subtle bg-bg-base transition-all duration-300 ${
        collapsed ? "w-[4.5rem]" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border-subtle">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <Library className="h-6 w-6 text-gold-400" />
            <span className="text-lg font-bold text-gradient-gold font-[var(--font-display)]">
              Biblio
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <Library className="h-6 w-6 text-gold-400" />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors ${collapsed ? "hidden" : ""}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            title={collapsed ? link.label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(link.href)
                ? "bg-gold-400/10 text-gold-300 border border-gold-400/20"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent"
            } ${collapsed ? "justify-center !px-0" : ""}`}
          >
            {link.icon}
            {!collapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border-subtle">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all mb-1 ${
            collapsed ? "justify-center !px-0" : ""
          }`}
          title={collapsed ? "Catálogo" : undefined}
        >
          <BookOpen className="h-5 w-5" />
          {!collapsed && <span>Ver Catálogo</span>}
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-error hover:bg-error/10 transition-all cursor-pointer ${
              collapsed ? "justify-center !px-0" : ""
            }`}
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sair</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
