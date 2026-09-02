# Arquitetura

O Sentinel TI usa Next.js App Router com componentes de servidor por padrão. A autenticação é mantida em cookies pelo `@supabase/ssr`; o proxy do Next.js atualiza a sessão e protege rotas privadas.

## Fluxo de análise

1. O servidor valida e normaliza o indicador com Zod.
2. URLs e IPs passam pelas regras anti-SSRF.
3. Adaptadores independentes consultam DNS, RDAP, TLS, NVD e provedores opcionais.
4. Cada resposta é normalizada como fonte, estado e evidências verificadas.
5. O motor determinístico soma impactos e calcula confiança separadamente.
6. Resultado e fontes são persistidos no Supabase sob o usuário autenticado.

Falhas são isoladas por adaptador. Nenhuma fonte opcional é simulada quando falta uma chave.

## Limites de confiança

Confiança combina cobertura de fontes (70%) e quantidade de evidências verificadas (até 30%). Ela não representa probabilidade estatística de malícia.
