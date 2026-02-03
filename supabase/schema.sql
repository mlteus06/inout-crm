-- Schema MVP Inout CRM (Supabase)

create extension if not exists "uuid-ossp";

create table if not exists public.accounts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.account_members (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (account_id, user_id)
);

create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  status text not null default 'nova',
  source text not null default 'Manual',
  name text not null,
  email text,
  phone text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.integrations_facebook (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  page_id text,
  page_name text,
  ad_account_id text,
  access_token text,
  token_type text,
  expires_at timestamptz,
  webhook_verify_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id)
);

create index if not exists leads_account_id_idx on public.leads(account_id);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists account_members_account_idx on public.account_members(account_id);

alter table public.leads
  add constraint leads_status_check
  check (status in ('nova', 'em_contato', 'qualificada', 'perdida'));

create or replace function public.is_account_member(_account_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.account_members am
    where am.account_id = _account_id
      and am.user_id = auth.uid()
  );
$$;

alter table public.accounts enable row level security;
alter table public.account_members enable row level security;
alter table public.leads enable row level security;
alter table public.integrations_facebook enable row level security;

create policy "accounts_select"
  on public.accounts for select
  using (public.is_account_member(id));

create policy "accounts_insert"
  on public.accounts for insert
  with check (auth.uid() = owner_id);

create policy "accounts_update"
  on public.accounts for update
  using (public.is_account_member(id));

create policy "account_members_select"
  on public.account_members for select
  using (public.is_account_member(account_id));

create policy "account_members_insert_owner"
  on public.account_members for insert
  with check (auth.uid() = user_id);

create policy "leads_select"
  on public.leads for select
  using (public.is_account_member(account_id));

create policy "leads_insert"
  on public.leads for insert
  with check (public.is_account_member(account_id));

create policy "leads_update"
  on public.leads for update
  using (public.is_account_member(account_id));

create policy "integrations_select"
  on public.integrations_facebook for select
  using (public.is_account_member(account_id));

create policy "integrations_insert"
  on public.integrations_facebook for insert
  with check (public.is_account_member(account_id));

create policy "integrations_update"
  on public.integrations_facebook for update
  using (public.is_account_member(account_id));
