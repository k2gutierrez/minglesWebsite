-- Lock down the legacy game tables.
--
-- Active on the Mingles project (zifpnidxmvofiqqbekhe) at the time of writing:
--
--   active_raids, friends, game_bosses, game_items, game_raids,
--   mingle_traits, player_inventory, redemption_codes, users
--
-- These are leftovers from a previous game system. Nothing in the current
-- website reads them, and nothing in this repository references them. With RLS
-- off they are exposed through PostgREST to anyone holding the publishable key,
-- which ships in the browser bundle. redemption_codes is the one that hurts:
-- anyone could read or delete every code.
--
-- What this does:
--   - enables RLS on each table, if it still exists
--   - revokes table privileges from anon and authenticated, as a second layer
--   - leaves the service role alone, so server side code is unaffected
--
-- Reversible, idempotent, and safe to run on a fresh project where these tables
-- do not exist. It does not change or delete data.

do $$
declare
    t       text;
    secured int := 0;
    skipped int := 0;
begin
    foreach t in array array[
        'active_raids',
        'friends',
        'game_bosses',
        'game_items',
        'game_raids',
        'mingle_traits',
        'player_inventory',
        'redemption_codes',
        'users'
        ]
        loop
            if to_regclass('public.' || quote_ident(t)) is null then
                raise notice 'skip  public.% (does not exist)', t;
                skipped := skipped + 1;
                continue;
            end if;

            execute format('alter table public.%I enable row level security', t);
            execute format('revoke all on table public.%I from anon, authenticated', t);
            raise notice 'lock  public.%', t;
            secured := secured + 1;
        end loop;

    raise notice 'done: % secured, % skipped', secured, skipped;
end
$$;

-- Verify. This should return zero rows.
--
--   select tablename from pg_tables
--   where schemaname = 'public' and not rowsecurity
--   order by tablename;
--
-- Then reload the site and click through: home, a section page, /portal,
-- /admin, and /apefest-raffle. Server routes use the service role and ignore
-- RLS, so they keep working regardless.
