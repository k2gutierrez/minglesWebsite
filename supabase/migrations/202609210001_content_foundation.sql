-- Mingles CMS foundation. Apply to a new Supabase project.
-- Never expose a service_role key to the Next.js browser bundle.
begin;
create table public.admin_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check(role in ('super_admin','editor')),
 created_at timestamptz not null default now()
);
alter table public.admin_roles enable row level security;
create or replace function public.is_content_admin() returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.admin_roles where user_id=auth.uid() and role in ('super_admin','editor'));
$$;
revoke all on function public.is_content_admin() from public;
grant execute on function public.is_content_admin() to authenticated;
create policy "View own role" on public.admin_roles for select to authenticated using(user_id=auth.uid());
grant select on public.admin_roles to authenticated;
-- Deliberately NO client insert/update/delete policy for roles.
create table public.site_content (
 id text primary key check(id='website'),
 published jsonb not null,
 updated_at timestamptz not null default now()
);
create table public.website_drafts (
 id text primary key check(id='website'),
 document jsonb not null,
 updated_by uuid references auth.users(id),
 updated_at timestamptz not null default now()
);
create table public.admin_audit_log (
 id bigint generated always as identity primary key,
 admin_id uuid references auth.users(id) on delete set null,
 action text not null,
 entity text not null,
 before_document jsonb,
 after_document jsonb,
 created_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
alter table public.website_drafts enable row level security;
alter table public.admin_audit_log enable row level security;
create policy "Published website is public" on public.site_content for select to anon,authenticated using(true);
create policy "Admins read drafts" on public.website_drafts for select to authenticated using(public.is_content_admin());
create policy "Admins read audit history" on public.admin_audit_log for select to authenticated using(public.is_content_admin());
grant select on public.site_content to anon,authenticated;
grant select on public.website_drafts,public.admin_audit_log to authenticated;
-- All content writes go through the audited function; no direct mutation grants.
create or replace function public.save_website(document jsonb, should_publish boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
declare old_document jsonb; public_document jsonb;
begin
 if not public.is_content_admin() then raise exception 'Content admin access required' using errcode='42501'; end if;
 if jsonb_typeof(document) is distinct from 'object'
 or jsonb_typeof(document->'hero') is distinct from 'object'
 or jsonb_typeof(document->'copy') is distinct from 'object'
 or jsonb_typeof(document->'nav') is distinct from 'array'
 or jsonb_typeof(document->'modules') is distinct from 'array'
 or jsonb_typeof(document->'projects') is distinct from 'array'
 or jsonb_typeof(document->'updates') is distinct from 'array'
 or jsonb_typeof(document->'stories') is distinct from 'array'
 or coalesce(length(trim(document#>>'{hero,title}')),0)=0
 then raise exception 'Invalid website content document'; end if;
 if octet_length(document::text)>8000000 then raise exception 'Document exceeds 8 MB'; end if;
 -- Serialize concurrent publishers; avoid interleaved history.
 perform pg_advisory_xact_lock(21092026);
 select published into old_document from public.site_content where id='website';
 insert into public.website_drafts(id,document,updated_by) values('website',document,auth.uid())
 on conflict(id) do update set document=excluded.document,updated_by=excluded.updated_by,updated_at=now();
 if should_publish then
  -- Unpublished entries and disabled records must not leak into public API responses.
  public_document := jsonb_set(document,'{updates}',coalesce((select jsonb_agg(e) from jsonb_array_elements(document->'updates') e where e->>'published'='true'),'[]'::jsonb));
  public_document := jsonb_set(public_document,'{stories}',coalesce((select jsonb_agg(e) from jsonb_array_elements(document->'stories') e where e->>'published'='true'),'[]'::jsonb));
  public_document := jsonb_set(public_document,'{projects}',coalesce((select jsonb_agg(e) from jsonb_array_elements(document->'projects') e where e->>'enabled'='true'),'[]'::jsonb));
  public_document := jsonb_set(public_document,'{modules}',coalesce((select jsonb_agg(e) from jsonb_array_elements(document->'modules') e where e->>'enabled'='true'),'[]'::jsonb));
  insert into public.site_content(id,published) values('website',public_document)
  on conflict(id) do update set published=excluded.published,updated_at=now();
 end if;
 insert into public.admin_audit_log(admin_id,action,entity,before_document,after_document)
 values(auth.uid(),case when should_publish then 'publish' else 'save_draft' end,'website',old_document,document);
end;
$$;
revoke all on function public.save_website(jsonb,boolean) from public;
grant execute on function public.save_website(jsonb,boolean) to authenticated;
create table public.media_assets (
 id uuid primary key default gen_random_uuid(), path text not null unique,
 url text not null, alt text not null, mime_type text not null,
 size_bytes bigint not null check(size_bytes between 1 and 2097152),
 created_at timestamptz not null default now()
);
alter table public.media_assets enable row level security;
create policy "Admins manage media metadata" on public.media_assets for all to authenticated using(public.is_content_admin()) with check(public.is_content_admin());
grant select,insert,update,delete on public.media_assets to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('public-media','public-media',true,2097152,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
create policy "Admin upload approved media" on storage.objects for insert to authenticated with check(bucket_id='public-media' and public.is_content_admin());
create policy "Admin read media objects" on storage.objects for select to authenticated using(bucket_id='public-media' and public.is_content_admin());
create policy "Admin update approved media" on storage.objects for update to authenticated using(bucket_id='public-media' and public.is_content_admin()) with check(bucket_id='public-media' and public.is_content_admin());
create policy "Admin remove approved media" on storage.objects for delete to authenticated using(bucket_id='public-media' and public.is_content_admin());
-- Reserved holder data: only a trusted verifier may write these records.
create table public.linked_wallets (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 chain_id bigint not null, address text not null check(address ~ '^0x[0-9a-f]{40}$'),
 verified_at timestamptz not null, unique(chain_id,address)
);
create table public.ownership_snapshots (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 chain_id bigint not null, contract_address text not null, token_id text not null,
 owner_address text not null, block_number bigint not null, checked_at timestamptz not null,
 unique(chain_id,contract_address,token_id)
);
alter table public.linked_wallets enable row level security;
alter table public.ownership_snapshots enable row level security;
create policy "Read own wallets" on public.linked_wallets for select to authenticated using(user_id=auth.uid());
create policy "Read own ownership" on public.ownership_snapshots for select to authenticated using(user_id=auth.uid());
grant select on public.linked_wallets,public.ownership_snapshots to authenticated;
create index linked_wallets_user on public.linked_wallets(user_id);
create index ownership_user on public.ownership_snapshots(user_id);
create index audit_recent on public.admin_audit_log(created_at desc);
commit;
