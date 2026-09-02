import Link from "next/link";
import {
  ArrowRight,
  FileSearch,
  Fingerprint,
  Globe2,
  LockKeyhole,
  Network,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const capabilities = [
  [
    Network,
    "IPs e ASN",
    "Reputação, registro RDAP, ASN e geolocalização aproximada quando disponível.",
  ],
  [
    Globe2,
    "Domínios e URLs",
    "DNS, registro, certificado TLS e evidências de diferentes provedores.",
  ],
  [
    Fingerprint,
    "Hashes",
    "Consulta de MD5, SHA-1 e SHA-256 sem baixar ou executar arquivos.",
  ],
  [
    FileSearch,
    "Vulnerabilidades",
    "CVE, descrição oficial, severidade e métricas publicadas pela NVD.",
  ],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="container grid gap-12 py-20 lg:grid-cols-[1.08fr_.92fr] lg:py-28">
            <div>
              <p className="mb-5 flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                <ShieldCheck size={18} /> Inteligência técnica com evidências
                rastreáveis
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-.035em] sm:text-6xl">
                Investigue indicadores sem perder a origem dos dados.
              </h1>
              <p className="muted mt-6 max-w-2xl text-lg leading-8">
                O Sentinel TI consolida consultas de IP, domínio, URL, hash, TLS
                e CVE, separando o que cada fonte informou da conclusão
                calculada pelo sistema.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="btn btn-primary" href="/cadastro">
                  Criar conta <ArrowRight size={18} />
                </Link>
                <Link className="btn" href="/entrar">
                  Já tenho acesso
                </Link>
              </div>
              <p className="muted mt-5 text-sm">
                Ferramenta de apoio à triagem. Não substitui investigação
                humana.
              </p>
            </div>
            <div
              className="surface self-center overflow-hidden rounded-xl shadow-[0_18px_60px_rgba(15,31,43,.12)]"
              aria-label="Prévia do resultado"
            >
              <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
                <span className="font-semibold">Resumo da análise</span>
                <span className="rounded-md bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--warning)]">
                  ATENÇÃO
                </span>
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-[120px_1fr]">
                <div className="flex aspect-square items-center justify-center rounded-full border-[10px] border-[var(--warning)] text-3xl font-bold">
                  42
                </div>
                <div>
                  <div className="mono break-all text-sm font-semibold">
                    example.com
                  </div>
                  <p className="muted mt-2 text-sm leading-6">
                    Pontuação calculada com 78% de confiança. Duas fontes
                    responderam; uma está temporariamente indisponível.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-md bg-[var(--surface-2)] p-3">
                      <b>DNS</b>
                      <br />
                      <span className="muted">Respondendo</span>
                    </div>
                    <div className="rounded-md bg-[var(--surface-2)] p-3">
                      <b>TLS</b>
                      <br />
                      <span className="muted">Válido</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-[var(--line)] px-5 py-4 text-sm">
                <b>Por que esta pontuação?</b>
                <p className="muted mt-1">
                  Cada sinal mostra fonte, horário, impacto e estado de
                  verificação.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="capacidades" className="container py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[var(--accent)]">
              Cobertura técnica
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-.025em]">
              Uma leitura consolidada, sem esconder lacunas.
            </h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
            {capabilities.map(([Icon, title, text]) => (
              <article key={String(title)} className="bg-[var(--surface)] p-7">
                <Icon size={24} aria-hidden />
                <h3 className="mt-4 text-lg font-bold">{String(title)}</h3>
                <p className="muted mt-2 leading-7">{String(text)}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          id="seguranca"
          className="bg-[var(--accent-2)] py-20 text-white"
        >
          <div className="container grid gap-10 lg:grid-cols-2">
            <div>
              <LockKeyhole size={28} />
              <h2 className="mt-5 text-3xl font-bold">
                Projetado para consultar, não para atacar.
              </h2>
              <p className="mt-4 max-w-xl text-white/75 leading-7">
                Sem upload ou execução de malware, sem proxy aberto e sem acesso
                a redes internas. Destinos privados, loopback, link-local e
                metadados de nuvem são bloqueados no servidor.
              </p>
            </div>
            <ul className="grid gap-3 text-sm">
              <li className="rounded-lg border border-white/15 p-4">
                Chaves de provedores ficam somente no servidor.
              </li>
              <li className="rounded-lg border border-white/15 p-4">
                Dados por usuário protegidos também no banco com RLS.
              </li>
              <li className="rounded-lg border border-white/15 p-4">
                Falha de uma fonte não invalida as evidências das demais.
              </li>
              <li className="rounded-lg border border-white/15 p-4">
                Pontuação e confiança são independentes e explicáveis.
              </li>
            </ul>
          </div>
        </section>
      </main>
      <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="container flex flex-col gap-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <b>Sentinel TI</b>
            <p className="muted mt-1">Projeto desenvolvido por Jackson Jean.</p>
          </div>
          <div className="flex gap-5">
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
