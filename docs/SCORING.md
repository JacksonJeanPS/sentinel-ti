# Motor de risco — versão 1.0.0

A pontuação começa em zero e soma impactos explícitos das evidências, limitada entre 0 e 100. Sinais positivos podem reduzir o total, mas nunca abaixo de zero.

| Evidência inicial          |                              Impacto |
| -------------------------- | -----------------------------------: |
| AbuseIPDB ≥ 75%            |                                  +55 |
| AbuseIPDB entre 25% e 74%  |                                  +25 |
| VirusTotal com detecção    | +25, mais 5 por detecção, máximo +70 |
| CVSS ≥ 9                   |                                  +75 |
| CVSS entre 7 e 8,9         |                                  +55 |
| CVSS entre 4 e 6,9         |                                  +30 |
| Certificado expirado       |                                  +45 |
| Certificado não autorizado |                                  +25 |
| Certificado válido         |                                   -5 |

Faixas: 0–14 sem evidências relevantes; 15–34 baixo; 35–59 atenção; 60–79 alto; 80–100 crítico. Sem evidência verificada, o resultado é inconclusivo e não recebe zero artificial.

Limitações: reputação muda com o tempo, fornecedores usam critérios próprios e baixa cobertura reduz a confiança. Resultados históricos guardam a versão do algoritmo.
