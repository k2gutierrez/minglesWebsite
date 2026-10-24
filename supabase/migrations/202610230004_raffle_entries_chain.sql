-- Rifa ApeFest: separa las entradas por red.
--
-- Antes la tabla solo tenía (raffle, number), así que una entrada de Curtis y
-- una de Ethereum mainnet con el mismo número chocaban. Ahora la clave es
-- (raffle, chain_id, number):
--
--   1          Ethereum mainnet (Chainlink VRF)
--   11155111   Ethereum Sepolia (ensayo del oráculo)
--   33111      ApeChain Curtis (vRNG, testnet)
--   33139      ApeChain mainnet (vRNG)
--
-- Las filas que ya existían se marcan como Curtis (33111), que es la red a la
-- que estuvo apuntando la página durante las pruebas de octubre 2026.
--
-- Aplicar después de 202610210003_raffle_entries.sql.
begin;

do $$
declare
  legacy_chain constant integer := 33111;
begin
  if to_regclass('public.raffle_entries') is null then
    raise exception
      'Falta public.raffle_entries. Aplica primero 202610210003_raffle_entries.sql.';
  end if;

  alter table public.raffle_entries
    add column if not exists chain_id integer;

  update public.raffle_entries
  set chain_id = legacy_chain
  where chain_id is null;

  alter table public.raffle_entries
    alter column chain_id set not null;

  -- Etiqueta legible para el CMS y para revisar la tabla a ojo.
  alter table public.raffle_entries
    add column if not exists network text
    generated always as (
      case chain_id
        when 1 then 'ethereum'
        when 11155111 then 'sepolia'
        when 33111 then 'curtis'
        when 33139 then 'apechain'
        else 'chain-' || chain_id::text
      end
    ) stored;

  -- La restricción vieja (raffle, number) impide tener el mismo número en dos
  -- redes. Se elimina y se reemplaza por la compuesta.
  alter table public.raffle_entries
    drop constraint if exists raffle_entries_raffle_number_key;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'raffle_entries_raffle_chain_number_key'
      and conrelid = 'public.raffle_entries'::regclass
  ) then
    alter table public.raffle_entries
      add constraint raffle_entries_raffle_chain_number_key
      unique (raffle, chain_id, number);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'raffle_entries_chain_id_check'
      and conrelid = 'public.raffle_entries'::regclass
  ) then
    alter table public.raffle_entries
      add constraint raffle_entries_chain_id_check check (chain_id > 0);
  end if;

  create index if not exists raffle_entries_chain_number_idx
    on public.raffle_entries (chain_id, number);

  create index if not exists raffle_entries_chain_wallet_idx
    on public.raffle_entries (chain_id, wallet);
end $$;

comment on column public.raffle_entries.chain_id is
  'EIP-155 chain id: 1 Ethereum mainnet, 11155111 Sepolia, 33111 ApeChain Curtis, 33139 ApeChain.';
comment on column public.raffle_entries.network is
  'Etiqueta legible derivada de chain_id (ethereum, sepolia, curtis, apechain).';

commit;
