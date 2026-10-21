-- Rifa ApeFest: datos de contacto por número.
-- El contrato guarda wallet y número; aquí vive lo que permite contactar al ganador.
-- Aplicar en el SQL Editor del proyecto o con `psql "$SUPABASE_DB_URL" -f este-archivo.sql`.
begin;

-- Limpieza puntual (21-oct-2026): en este proyecto ya existía una tabla
-- `raffle_entries` VACÍA con otro esquema (raffle_id / wallet_address) de un
-- scaffold anterior. Con `create table if not exists` se saltaba la creación y
-- el índice fallaba con «column wallet does not exist». Solo se elimina si sigue
-- teniendo el esquema viejo; si ya tiene el nuevo, no se toca nada.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'raffle_entries'
      and column_name = 'raffle_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'raffle_entries'
      and column_name = 'wallet'
  ) then
    drop table public.raffle_entries;
  end if;
end $$;

create table if not exists public.raffle_entries (
  id bigint generated always as identity primary key,
  raffle text not null default 'apefest-2026',
  number smallint not null check (number between 1 and 25),
  wallet text not null check (wallet ~ '^0x[0-9a-f]{40}$'),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 5 and 160),
  phone text not null check (char_length(phone) between 7 and 32),
  note text check (note is null or char_length(note) <= 280),
  tx_hash text check (tx_hash is null or tx_hash ~ '^0x[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint raffle_entries_raffle_number_key unique (raffle, number)
);

create index if not exists raffle_entries_wallet_idx
  on public.raffle_entries (wallet);

alter table public.raffle_entries enable row level security;

-- Sin políticas de INSERT/UPDATE/DELETE: solo escribe la ruta del servidor con la
-- service_role (que ignora RLS). La lectura queda para administradores del CMS.
drop policy if exists "Admins read raffle entries" on public.raffle_entries;
create policy "Admins read raffle entries"
  on public.raffle_entries
  for select
  to authenticated
  using (public.is_content_admin());

grant select on public.raffle_entries to authenticated;

comment on table public.raffle_entries is
  'Contacto por número de la rifa ApeFest. Escribe solo el backend con service_role.';

commit;
