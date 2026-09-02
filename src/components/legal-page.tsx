import Link from "next/link";
import { ShieldCheck } from "lucide-react";
export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="container flex min-h-16 items-center justify-between">
          <Link className="flex items-center gap-2 font-bold" href="/">
            <ShieldCheck size={22} />
            Sentinel TI
          </Link>
          <Link className="btn" href="/">
            Voltar
          </Link>
        </div>
      </header>
      <main className="container max-w-3xl py-14">
        <h1 className="text-4xl font-bold">{title}</h1>
        <div className="muted mt-8 grid gap-6 leading-7">{children}</div>
      </main>
    </>
  );
}
