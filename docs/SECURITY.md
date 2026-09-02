# Modelo de segurança

- Segredos de provedores são lidos somente por Route Handlers no runtime Node.js.
- A chave publicável do Supabase é segura no cliente quando combinada com RLS; secret/service role nunca deve usar prefixo `NEXT_PUBLIC_`.
- URLs aceitam apenas HTTP/HTTPS, sem credenciais embutidas. A resolução DNS é inspecionada e bloqueia loopback, redes privadas, link-local, multicast e metadados conhecidos.
- Consultas têm timeout, limite por usuário e respostas sem stack trace.
- O sistema não baixa, armazena nem executa amostras e não oferece proxy genérico.
- Resultados distinguem evidência da fonte, conclusão do algoritmo e indisponibilidade.

Observação: rate limiting em memória é uma barreira básica por instância. Em escala, substitua por armazenamento distribuído com expiração atômica.
