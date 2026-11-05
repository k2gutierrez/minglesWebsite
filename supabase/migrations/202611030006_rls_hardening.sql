-- RLS hardening for the public schema.
--
-- Why this exists:
-- PostgREST exposes every table in `public` to anyone holding the publishable
-- key. That key ships inside the browser bundle by design, so "public" here
-- means the open internet: read, insert, update and delete.
--
-- The Supabase advisor flags this as `rls_disabled_in_public`.
--
-- What this migration does: turns RLS on for every table in `public` that does
-- not have it. Nothing else. It is idempotent, safe to run twice, and it does
-- not create policies.
--
-- Why it is safe for this app:
-- - The /api routes use the service role key, which bypasses RLS entirely.
-- - Content loading uses the publishable key but only reads site_content, which
--   already has RLS and a public read policy.
-- - Browser side table access is limited to website_drafts, media_assets and
--   admin_audit_log, all inside /admin, and all three already have RLS and
--   policies from the earlier migrations.
--
-- What to check if something reads empty afterwards:
-- A table with RLS on and zero policies returns zero rows to anon and
-- authenticated, not an error. If a page starts rendering empty content, that
-- table was being read with the publishable key and needs a policy back, for
-- example:
--
--   create policy "public read" on public.site_content
--     for select to anon, authenticated using (true);
--
-- Diagnostic, run this first and keep the output:
--
--   select n.nspname as schema,
--          c.relname as table,
--          c.relrowsecurity as rls,
--          (select count(*) from pg_policies p
--            where p.schemaname = n.nspname and p.tablename = c.relname) as policies
--   from pg_class c
--   join pg_namespace n on n.oid = c.relnamespace
--   where n.nspname = 'public' and c.relkind = 'r'
--   order by c.relrowsecurity, c.relname;

do $$
declare
    r       record;
    changed int := 0;
begin
    for r in
        select c.relname
        from pg_class c
                 join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relkind = 'r'
          and not c.relrowsecurity
        order by c.relname
        loop
            raise notice 'enabling RLS on public.%', r.relname;
            execute format('alter table public.%I enable row level security', r.relname);
            changed := changed + 1;
        end loop;

    if changed = 0 then
        raise notice 'nothing to do, every table in public already has RLS';
    else
        raise notice 'done, % table(s) now have RLS', changed;
    end if;
end
$$;

-- Verify. Both columns should read `true`, and every table should have at least
-- one policy before you call it finished.
--
--   select tablename, rowsecurity
--   from pg_tables where schemaname = 'public' order by rowsecurity, tablename;
