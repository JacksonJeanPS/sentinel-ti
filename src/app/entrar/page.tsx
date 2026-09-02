import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { signIn } from "@/app/auth/actions";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  return (
    <AuthCard
      title="Acesse sua conta"
      intro="Entre para analisar indicadores e manter seu histórico privado."
      footer={
        <>
          Ainda não possui conta?{" "}
          <Link className="font-semibold text-[var(--accent)]" href="/cadastro">
            Cadastre-se
          </Link>
        </>
      }
    >
      {query.mensagem && (
        <p
          role="status"
          className="mb-5 rounded-lg bg-[var(--surface-2)] p-3 text-sm"
        >
          {query.mensagem === "confirme-email"
            ? "Cadastro recebido. Confirme o link enviado ao seu e-mail."
            : "Se o e-mail estiver cadastrado, você receberá as instruções de recuperação."}
        </p>
      )}
      {query.erro && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-red-100 p-3 text-sm text-red-900"
        >
          Não foi possível entrar. Confira os dados e tente novamente.
        </p>
      )}
      <form action={signIn} className="grid gap-4">
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
            autoComplete="current-password"
            minLength={10}
            required
          />
        </label>
        <div className="flex justify-end">
          <Link
            className="text-sm text-[var(--accent)]"
            href="/recuperar-senha"
          >
            Esqueci minha senha
          </Link>
        </div>
        <button className="btn btn-primary w-full" type="submit">
          Entrar
        </button>
      </form>
    </AuthCard>
  );
}
