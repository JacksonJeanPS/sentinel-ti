import { signOut } from "@/app/auth/actions";
export const metadata = { title: "Configurações" };
export default function Settings() {
  return (
    <>
      <h1 className="text-3xl font-bold">Configurações</h1>
      <p className="muted mt-2">
        Preferências, segurança e retenção dos seus dados.
      </p>
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <section className="surface rounded-xl p-6">
          <h2 className="text-lg font-bold">Preferências</h2>
          <p className="muted mt-2 text-sm leading-6">
            O tema escolhido fica salvo apenas neste navegador. Use o controle
            no cabeçalho para alternar.
          </p>
        </section>
        <section className="surface rounded-xl p-6">
          <h2 className="text-lg font-bold">Retenção e privacidade</h2>
          <p className="muted mt-2 text-sm leading-6">
            As consultas autenticadas pertencem somente à sua conta. O projeto
            recomenda retenção máxima de 90 dias para respostas completas de
            provedores.
          </p>
        </section>
        <section className="surface rounded-xl p-6">
          <h2 className="text-lg font-bold">Sessão</h2>
          <form action={signOut} className="mt-4">
            <button className="btn" type="submit">
              Sair da conta
            </button>
          </form>
        </section>
        <section className="surface rounded-xl border-l-4 border-l-[var(--danger)] p-6">
          <h2 className="text-lg font-bold">Excluir conta</h2>
          <p className="muted mt-2 text-sm leading-6">
            A exclusão permanente exige confirmação forte e remoção das sessões.
            Disponível mediante solicitação ao administrador nesta versão.
          </p>
        </section>
      </div>
    </>
  );
}
