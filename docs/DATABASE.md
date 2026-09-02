# Banco de dados e RLS

As migrations em `supabase/migrations` criam `profiles`, `analyses`, `analysis_sources`, `favorites`, `reports`, `api_usage` e `audit_logs`.

Todas as tabelas expostas possuem RLS. Políticas de leitura e alteração combinam `TO authenticated` com `(select auth.uid()) = user_id`; não dependem de filtros do frontend. As tabelas internas de uso e auditoria permitem apenas leitura do próprio usuário pelo cliente. Inserções nessas tabelas devem ser realizadas por código de servidor autorizado.

O gatilho de criação de perfil fica no schema `private`, tem `search_path` vazio e execução revogada de papéis públicos.
