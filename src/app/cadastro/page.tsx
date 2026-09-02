import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { signUp } from "@/app/auth/actions";
export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  return (
    <AuthCard
      title="Crie sua conta"
      intro="Seu histórico será isolado e protegido por políticas no banco de dados."
      footer={
        <>
          Já possui conta?{" "}
          <Link className="font-semibold text-[var(--accent)]" href="/entrar">
            Entrar
          </Link>
        </>
      }
    >
      {query.erro && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-red-100 p-3 text-sm text-red-900"
        >
          Não foi possível concluir o cadastro. Use outro e-mail ou revise a
          senha.
        </p>
      )}
      <form action={signUp} className="grid gap-4">
        <label>
          <span className="label">Nome de exibição</span>
          <input
            className="field"
            name="name"
            autoComplete="name"
            maxLength={80}
            required
          />
        </label>
        <label>
          <span className="label">E-mail</span>
          <input
            className="field"
            type="email"
            name="email"
            autoComplete="email"
            required
          />
        </label>
        <label>
          <span className="label">Senha</span>
          <input
            className="field"
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
          <span className="muted mt-1 block text-xs">
            Mínimo de 10 caracteres.
          </span>
        </label>
        <button className="btn btn-primary w-full" type="submit">
          Criar conta
        </button>
      </form>
    </AuthCard>
  );
}
