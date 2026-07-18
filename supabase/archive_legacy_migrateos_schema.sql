-- One-time recovery for a database created with the pre-Alembic Supabase SQL schema.
--
-- This does NOT delete data. It moves only the legacy MigrateOS objects out of
-- `public` so the current Alembic migrations can create their authoritative
-- replacements. Run once in the Supabase SQL Editor, then redeploy Render.
-- Do not run this on a database that already has an `alembic_version` table.

begin;

create schema if not exists migrateos_legacy_20260718;

do $$
declare
  legacy_table text;
begin
  foreach legacy_table in array array[
    'projects',
    'repositories',
    'repository_snapshots',
    'migration_plans',
    'migration_steps',
    'migration_reports',
    'agent_logs',
    'analysis_cache',
    'events',
    'audit_logs',
    'prompt_templates',
    'execution_sessions'
  ]
  loop
    if to_regclass(format('public.%I', legacy_table)) is not null then
      execute format(
        'alter table public.%I set schema migrateos_legacy_20260718',
        legacy_table
      );
    end if;
  end loop;
end $$;

do $$
begin
  if to_regclass('public.project_plan_overview') is not null then
    alter view public.project_plan_overview set schema migrateos_legacy_20260718;
  end if;
end $$;

-- These functions belong only to the archived RLS model. Moving them avoids
-- leaving stale public functions that refer to the old project ownership shape.
do $$
begin
  if to_regprocedure('public.set_updated_at()') is not null then
    alter function public.set_updated_at() set schema migrateos_legacy_20260718;
  end if;

  if to_regprocedure('public.owns_project(uuid)') is not null then
    alter function public.owns_project(uuid) set schema migrateos_legacy_20260718;
  end if;
end $$;

commit;

-- Expected before redeploy: all values are null.
select
  to_regclass('public.alembic_version') as alembic_version,
  to_regclass('public.projects') as projects,
  to_regclass('public.repositories') as repositories,
  to_regclass('public.migration_jobs') as migration_jobs;
