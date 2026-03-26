"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type AuthState } from "@/actions/auth";
import { UserPlus, Mail, Lock, User, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    register,
    undefined
  );

  return (
    <div className="glass-card p-8 slide-up">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-text-primary">Criar sua conta</h2>
        <p className="mt-1 text-sm text-text-muted">
          Cadastre-se para acessar o acervo e fazer empréstimos
        </p>
      </div>

      {state?.message && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">
            Nome completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Seu nome"
              className="input-field !pl-10"
            />
          </div>
          {state?.errors?.name && (
            <p className="mt-1 text-xs text-error">{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="input-field !pl-10"
            />
          </div>
          {state?.errors?.email && (
            <p className="mt-1 text-xs text-error">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              className="input-field !pl-10"
            />
          </div>
          {state?.errors?.password && (
            <p className="mt-1 text-xs text-error">{state.errors.password[0]}</p>
          )}
        </div>

        <button type="submit" disabled={pending} className="btn-primary w-full !py-3 mt-2">
          {pending ? (
            <span className="h-5 w-5 border-2 border-bg-deep/30 border-t-bg-deep rounded-full animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {pending ? "Criando conta..." : "Cadastrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  );
}
