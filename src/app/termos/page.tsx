import { LegalPage } from "@/components/legal-page";
export const metadata = { title: "Termos de uso" };
export default function Terms() {
  return (
    <LegalPage title="Termos de uso">
      <section>
        <h2 className="text-xl font-bold text-[var(--text)]">Uso autorizado</h2>
        <p>
          Use o serviço apenas para indicadores públicos, próprios ou cuja
          análise tenha sido autorizada. São proibidos abuso, tentativa de
          contornar limites e uso para acesso a redes internas.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-[var(--text)]">Limitações</h2>
        <p>
          Classificações dependem das fontes disponíveis no momento. Ausência de
          evidência não comprova segurança, e um resultado não substitui
          investigação ou decisão profissional.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-[var(--text)]">
          Disponibilidade
        </h2>
        <p>
          Provedores externos possuem limites e podem falhar. O Sentinel TI
          identifica essas situações sem apresentar dados simulados como reais.
        </p>
      </section>
    </LegalPage>
  );
}
