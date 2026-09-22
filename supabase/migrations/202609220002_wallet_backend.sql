begin;
-- Only the Next.js backend's service_role may create or consume wallet challenges.
create table public.wallet_challenges (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 address text not null check(address ~ '^0x[0-9a-f]{40}$'),
 chain_id bigint not null check(chain_id=33139),
 message text not null,
 expires_at timestamptz not null,
 used_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.api_rate_limits (
 user_id uuid not null references auth.users(id) on delete cascade,
 action text not null,
 window_start timestamptz not null,
 count integer not null default 0,
 primary key(user_id,action)
);
create table public.holder_snapshots (
 wallet_id uuid primary key references public.linked_wallets(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 address text not null,
 contract_address text not null,
 token_ids jsonb not null check(jsonb_typeof(token_ids)='array'),
 balance text not null check(balance ~ '^[0-9]+$'),
 block_number text not null check(block_number ~ '^[0-9]+$'),
 checked_at timestamptz not null
);
alter table public.wallet_challenges enable row level security;
alter table public.api_rate_limits enable row level security;
alter table public.holder_snapshots enable row level security;
revoke all on public.wallet_challenges,public.api_rate_limits,public.holder_snapshots from anon,authenticated;
grant all on public.wallet_challenges,public.api_rate_limits,public.holder_snapshots to service_role;
grant select on public.holder_snapshots to authenticated;
create policy "Owner reads own collection snapshot" on public.holder_snapshots for select to authenticated using(user_id=auth.uid());
grant all on public.linked_wallets,public.ownership_snapshots to service_role;
create index holder_snapshot_user on public.holder_snapshots(user_id);
create index wallet_challenge_owner on public.wallet_challenges(user_id,expires_at);

create function public.take_api_slot(p_user uuid,p_action text,p_limit integer,p_seconds integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare current_row public.api_rate_limits;
begin
 if p_limit<1 or p_seconds<1 then raise exception 'Invalid rate limit'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user::text||p_action,0));
 select * into current_row from public.api_rate_limits where user_id=p_user and action=p_action;
 if not found or current_row.window_start<=now()-make_interval(secs=>p_seconds) then
  insert into public.api_rate_limits(user_id,action,window_start,count) values(p_user,p_action,now(),1)
  on conflict(user_id,action) do update set window_start=now(),count=1;return true;
 end if;
 if current_row.count>=p_limit then return false;end if;
 update public.api_rate_limits set count=count+1 where user_id=p_user and action=p_action;return true;
end;$$;

create function public.consume_wallet_challenge(p_id uuid,p_user uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare challenge public.wallet_challenges; wallet public.linked_wallets;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 select * into challenge from public.wallet_challenges where id=p_id and user_id=p_user for update;
 if not found or challenge.used_at is not null or challenge.expires_at<=now() then raise exception 'Expired or consumed challenge';end if;
 select * into wallet from public.linked_wallets where chain_id=challenge.chain_id and address=challenge.address;
 if found and wallet.user_id<>p_user then raise exception 'Wallet already belongs to another account';end if;
 if wallet.id is null and (select count(*) from public.linked_wallets where user_id=p_user)>=5 then raise exception 'Maximum five wallets';end if;
 insert into public.linked_wallets(user_id,chain_id,address,verified_at) values(p_user,challenge.chain_id,challenge.address,now())
 on conflict(chain_id,address) do update set verified_at=now() where public.linked_wallets.user_id=p_user returning * into wallet;
 if wallet.id is null then raise exception 'Wallet already belongs to another account';end if;
 update public.wallet_challenges set used_at=now() where id=p_id;
 return jsonb_build_object('id',wallet.id,'address',wallet.address,'chain_id',wallet.chain_id,'verified_at',wallet.verified_at);
end;$$;

create function public.unlink_holder_wallet(p_wallet uuid,p_user uuid)
returns void language plpgsql security definer set search_path='' as $$
declare wallet public.linked_wallets;
begin
 select * into wallet from public.linked_wallets where id=p_wallet and user_id=p_user for update;
 if not found then raise exception 'Wallet not found';end if;
 -- A previously issued signed challenge cannot relink this wallet after unlink.
 update public.wallet_challenges set used_at=now() where user_id=p_user and address=wallet.address and used_at is null;
 delete from public.ownership_snapshots where user_id=p_user and owner_address=wallet.address;
 delete from public.linked_wallets where id=p_wallet;
end;$$;

create function public.save_holder_snapshot(p_wallet uuid,p_user uuid,p_contract text,p_tokens jsonb,p_balance text,p_block text,p_checked timestamptz)
returns void language plpgsql security definer set search_path='' as $$
declare wallet public.linked_wallets; old_block numeric;
begin
 select * into wallet from public.linked_wallets where id=p_wallet and user_id=p_user for update;
 if not found then raise exception 'Wallet no longer linked';end if;
 if jsonb_typeof(p_tokens)<>'array' or p_balance !~ '^[0-9]+$' or p_block !~ '^[0-9]+$' or jsonb_array_length(p_tokens)<>p_balance::numeric then raise exception 'Incomplete snapshot';end if;
 if (select count(distinct value) from jsonb_array_elements_text(p_tokens))<>jsonb_array_length(p_tokens) then raise exception 'Duplicate tokens';end if;
 select block_number::numeric into old_block from public.holder_snapshots where wallet_id=p_wallet;
 if old_block>p_block::numeric then raise exception 'Older block rejected';end if;
 insert into public.holder_snapshots(wallet_id,user_id,address,contract_address,token_ids,balance,block_number,checked_at)
 values(p_wallet,p_user,wallet.address,p_contract,p_tokens,p_balance,p_block,p_checked)
 on conflict(wallet_id) do update set token_ids=excluded.token_ids,balance=excluded.balance,block_number=excluded.block_number,checked_at=excluded.checked_at,contract_address=excluded.contract_address;
end;$$;

create function public.cleanup_wallet_security() returns void language sql security definer set search_path='' as $$
 delete from public.wallet_challenges where expires_at<now()-interval '2 days';
 delete from public.api_rate_limits where window_start<now()-interval '2 days';
$$;
-- Even a content super-admin cannot forge a wallet verification via the Data API.
revoke all on function public.take_api_slot(uuid,text,integer,integer),public.consume_wallet_challenge(uuid,uuid),public.unlink_holder_wallet(uuid,uuid),public.save_holder_snapshot(uuid,uuid,text,jsonb,text,text,timestamptz),public.cleanup_wallet_security() from public,anon,authenticated;
grant execute on function public.take_api_slot(uuid,text,integer,integer),public.consume_wallet_challenge(uuid,uuid),public.unlink_holder_wallet(uuid,uuid),public.save_holder_snapshot(uuid,uuid,text,jsonb,text,text,timestamptz),public.cleanup_wallet_security() to service_role;
commit;
