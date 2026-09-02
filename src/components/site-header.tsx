"use client";
import Link from "next/link";
import { Moon, ShieldCheck, Sun } from "lucide-react";
import { useState } from "react";
export function SiteHeader({ app = false }: { app?: boolean }) {
  const [dark, setDark] = useState(false);
  const toggle = () => {
    const value = !document.documentElement.classList.contains("dark");
    setDark(value);
    document.documentElement.classList.toggle("dark", value);
    localStorage.theme = value ? "dark" : "light";
  };
  return (
    <header className="no-print sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--surface)]/95 backdrop-blur">
      <div className="container flex min-h-16 items-center justify-between gap-4">
        <Link
          href={app ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-bold tracking-[-.02em]"
        >
          <ShieldCheck size={24} aria-hidden />
          <span>Sentinel TI</span>
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-2">
          {!app && (
            <>
              <Link
                className="hidden px-3 py-2 text-sm sm:block"
                href="/#capacidades"
              >
                Capacidades
              </Link>
              <Link
                className="hidden px-3 py-2 text-sm sm:block"
                href="/#seguranca"
              >
                Segurança
              </Link>
              <Link className="btn" href="/entrar">
                Entrar
              </Link>
              <Link
                className="btn btn-primary hidden sm:inline-flex"
                href="/cadastro"
              >
                Criar conta
              </Link>
            </>
          )}
          {app && (
            <>
              <Link
                className="hidden px-3 py-2 text-sm md:block"
                href="/historico"
              >
                Histórico
              </Link>
              <Link
                className="hidden px-3 py-2 text-sm md:block"
                href="/configuracoes"
              >
                Configurações
              </Link>
            </>
          )}
          <button
            className="btn px-3"
            onClick={toggle}
            aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
