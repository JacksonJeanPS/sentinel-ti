import Link from "next/link";
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-4 text-center">
      <div>
        <p className="mono text-sm text-[var(--accent)]">404</p>
        <h1 className="mt-3 text-4xl font-bold">Página não encontrada</h1>
        <p className="muted mt-3">
          O endereço informado não existe ou foi movido.
        </p>
        <Link className="btn btn-primary mt-7" href="/">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
