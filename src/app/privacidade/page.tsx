import { LegalPage } from "@/components/legal-page";
export const metadata = { title: "Privacidade" };
export default function Privacy() {
  return (
    <LegalPage title="Política de privacidade">
      <section>
        <h2 className="text-xl font-bold text-[var(--text)]">Dados tratados</h2>
        <p>
          O Sentinel TI armazena identificação da conta, preferências e
          indicadores consultados para fornecer histórico, favoritos e
          auditoria. Chaves de provedores e credenciais não são gravadas nos
          resultados.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-[var(--text)]">
          Finalidade e retenção
        </h2>
        <p>
          Os dados são usados para executar as análises e proteger o serviço
          contra abuso. Respostas completas de provedores devem ser eliminadas
          após o período configurado, recomendado em até 90 dias.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-[var(--text)]">
          Controle do usuário
        </h2>
        <p>
          Usuários podem remover análises e favoritos. Solicitações de
          exportação ou exclusão definitiva devem ser direcionadas ao
          responsável pelo projeto.
        </p>
      </section>
      <p>Última atualização: 1º de setembro de 2026.</p>
    </LegalPage>
  );
}
