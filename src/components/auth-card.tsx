import Link from "next/link";
import { ShieldCheck } from "lucide-react";
export function AuthCard({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="surface w-full max-w-md rounded-xl p-7 shadow-[0_16px_50px_rgba(15,31,43,.08)]">
        <Link href="/" className="mb-8 flex items-center gap-2 font-bold">
          <ShieldCheck size={24} /> Sentinel TI
        </Link>
        <h1 className="text-2xl font-bold tracking-[-.02em]">{title}</h1>
        <p className="muted mt-2 leading-6">{intro}</p>
        <div className="mt-7">{children}</div>
        <div className="muted mt-7 border-t border-[var(--line)] pt-5 text-sm">
          {footer}
        </div>
      </section>
    </main>
  );
}
