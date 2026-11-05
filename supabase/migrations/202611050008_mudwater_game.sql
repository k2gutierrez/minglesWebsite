-- The Last Barrel: game tables.
--
-- Separate from the site's linked_wallets on purpose. That table allows up to
-- five wallets per account, which is fine for the portal and breaks the game
-- rule of one X account to one wallet.
--
-- Reads and writes go through the Next.js API with the service role. The
-- browser only uses the publishable key for auth, so these tables have RLS on
-- and no policies at all: anon and authenticated cannot touch them.

begin;

create table if not exists public.mw_players (
    id         uuid primary key references auth.users (id) on delete cascade,
    x_user_id  text not null unique,
    handle     text not null,
    avatar_url text,
    created_at timestamptz not null default now()
);

comment on table public.mw_players is 'One row per X account that has declared a post. x_user_id is the stable numeric id, handle is only a label.';

create table if not exists public.mw_wallets (
    player_id uuid primary key references public.mw_players (id) on delete cascade,
    address   text not null check (address ~ '^0x[0-9a-f]{40}$'),
    chain_id  bigint not null,
    bound_at  timestamptz not null default now()
);

comment on table public.mw_wallets is 'player_id is the primary key, so one wallet per account. The address index below makes it one account per wallet.';

create unique index if not exists mw_wallets_address_idx
    on public.mw_wallets (chain_id, lower(address));

create table if not exists public.mw_wallet_challenges (
    id         uuid primary key,
    player_id  uuid not null references public.mw_players (id) on delete cascade,
    address    text not null check (address ~ '^0x[0-9a-f]{40}$'),
    chain_id   bigint not null,
    message    text not null,
    expires_at timestamptz not null,
    used_at    timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists mw_wallet_challenges_player_idx
    on public.mw_wallet_challenges (player_id);

create table if not exists public.mw_passes (
    id         uuid primary key default gen_random_uuid(),
    player_id  uuid not null references public.mw_players (id) on delete cascade,
    post_url   text not null,
    activation smallint not null check (activation between 1 and 2),
    expiry     timestamptz not null,
    status     text not null default 'pending'
        check (status in ('pending', 'granted', 'failed')),
    tx_hash    text,
    failure    text,
    created_at timestamptz not null default now()
);

comment on table public.mw_passes is 'One row per declared post. status pending means the grantPass transaction has not confirmed yet.';

create unique index if not exists mw_passes_activation_idx
    on public.mw_passes (player_id, activation);

create index if not exists mw_passes_player_idx
    on public.mw_passes (player_id, created_at desc);

alter table public.mw_players enable row level security;
alter table public.mw_wallets enable row level security;
alter table public.mw_wallet_challenges enable row level security;
alter table public.mw_passes enable row level security;

-- No policies on purpose. With RLS on and nothing granted, anon and
-- authenticated see zero rows. service_role bypasses RLS, which is what the
-- API routes use.

grant all on public.mw_players, public.mw_wallets,
    public.mw_wallet_challenges, public.mw_passes to service_role;

commit;
