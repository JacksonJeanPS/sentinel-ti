create extension if not exists pgcrypto;

create type public.indicator_type as enum ('ipv4','ipv6','domain','url','md5','sha1','sha256','cve');
create type public.risk_level as enum ('safe','low','attention','high','critical','inconclusive');
create type public.analysis_status as enum ('pending','running','completed','partial','failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 80),
  theme text not null default 'system' check (theme in ('light','dark','system')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.analyses (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  indicator text not null check (char_length(indicator) between 2 and 2048), indicator_type public.indicator_type not null,
  status public.analysis_status not null default 'pending', risk_score smallint check (risk_score between 0 and 100),
  confidence smallint not null default 0 check (confidence between 0 and 100), risk_level public.risk_level not null default 'inconclusive',
  algorithm_version text not null, duration_ms integer check (duration_ms >= 0), summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), completed_at timestamptz
);
create table public.analysis_sources (
  id uuid primary key default gen_random_uuid(), analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, provider text not null, status text not null,
  latency_ms integer not null default 0, evidence jsonb not null default '[]'::jsonb, error_code text,
  collected_at timestamptz not null default now(), expires_at timestamptz
);
create table public.favorites (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid not null references public.analyses(id) on delete cascade, created_at timestamptz not null default now(), unique(user_id,analysis_id)
);
create table public.reports (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid not null references public.analyses(id) on delete cascade, created_at timestamptz not null default now()
);
create table public.api_usage (
  id bigint generated always as identity primary key, user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, request_count integer not null default 1 check(request_count > 0), status_code integer,
  period_start timestamptz not null default date_trunc('day',now()), created_at timestamptz not null default now()
);
create table public.audit_logs (
  id bigint generated always as identity primary key, user_id uuid not null references auth.users(id) on delete cascade,
  action text not null, resource_type text not null, resource_id uuid, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analyses_user_created_idx on public.analyses(user_id,created_at desc);
create index analyses_user_type_risk_idx on public.analyses(user_id,indicator_type,risk_level);
create index analysis_sources_analysis_idx on public.analysis_sources(analysis_id);
create index favorites_user_created_idx on public.favorites(user_id,created_at desc);
create index api_usage_user_period_idx on public.api_usage(user_id,period_start desc);
create index audit_logs_user_created_idx on public.audit_logs(user_id,created_at desc);

alter table public.profiles enable row level security; alter table public.analyses enable row level security;
alter table public.analysis_sources enable row level security; alter table public.favorites enable row level security;
alter table public.reports enable row level security; alter table public.api_usage enable row level security; alter table public.audit_logs enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy analyses_select_own on public.analyses for select to authenticated using ((select auth.uid())=user_id);
create policy analyses_insert_own on public.analyses for insert to authenticated with check ((select auth.uid())=user_id);
create policy analyses_update_own on public.analyses for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy analyses_delete_own on public.analyses for delete to authenticated using ((select auth.uid())=user_id);
create policy sources_select_own on public.analysis_sources for select to authenticated using ((select auth.uid())=user_id);
create policy sources_insert_own on public.analysis_sources for insert to authenticated with check ((select auth.uid())=user_id);
create policy sources_delete_own on public.analysis_sources for delete to authenticated using ((select auth.uid())=user_id);
create policy favorites_all_own on public.favorites for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy reports_all_own on public.reports for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy api_usage_select_own on public.api_usage for select to authenticated using ((select auth.uid())=user_id);
create policy audit_logs_select_own on public.audit_logs for select to authenticated using ((select auth.uid())=user_id);

grant select,insert,update,delete on public.profiles,public.analyses,public.analysis_sources,public.favorites,public.reports to authenticated;
grant select on public.api_usage,public.audit_logs to authenticated;
revoke all on public.profiles,public.analyses,public.analysis_sources,public.favorites,public.reports,public.api_usage,public.audit_logs from anon;

create schema if not exists private;
create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','Usuário')); return new; end; $$;
revoke all on function private.handle_new_user() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();
