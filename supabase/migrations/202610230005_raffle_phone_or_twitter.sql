-- Rifa ApeFest: el campo `phone` ahora acepta teléfono o Twitter/X.
--
-- La columna se sigue llamando `phone` para no romper las filas y el API
-- existentes, pero la etiqueta visible es "Phone or Twitter" y el contenido
-- puede ser:
--   - un teléfono (7-32 caracteres con +, (), -, espacios, dígitos y puntos),
--   - un handle de X/Twitter con o sin @ (2-15 caracteres alfanuméricos o _),
--   - una URL https://x.com/handle o https://twitter.com/handle.
--
-- El check viejo exigía entre 7 y 32 caracteres y rechazaba handles cortos.
-- Este migration lo reemplaza por 2..80.
begin;

do $$
declare
  c record;
begin
  if to_regclass('public.raffle_entries') is null then
    raise exception
      'Falta public.raffle_entries. Aplica primero 202610210003_raffle_entries.sql.';
  end if;

  -- Elimina cualquier check que valide char_length(phone). Así funciona tanto
  -- con el nombre autogenerado del check viejo como al re-ejecutar esta
  -- migración.
  for c in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.raffle_entries'::regclass
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%char_length(phone)%'
  loop
    execute format(
      'alter table public.raffle_entries drop constraint %I',
      c.conname
    );
  end loop;

  alter table public.raffle_entries
    add constraint raffle_entries_phone_check
    check (char_length(phone) between 2 and 80);
end $$;

comment on column public.raffle_entries.phone is
  'Teléfono o handle/URL de Twitter/X del participante.';

commit;
