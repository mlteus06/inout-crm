-- Schema MVP Inout CRM (Supabase)

create extension if not exists "uuid-ossp";

create table if not exists public.accounts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  new_lead_notifications boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.accounts
  add column if not exists new_lead_notifications boolean not null default true;

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

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.invites (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  email text not null,
  role text not null default 'member',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (account_id, email)
);

create table if not exists public.api_keys (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  key text not null unique,
  label text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
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
security definer
set search_path = public
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
alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.api_keys enable row level security;
alter table public.subscriptions enable row level security;

create policy "accounts_select"
  on public.accounts for select
  using (public.is_account_member(id));

create policy "accounts_insert"
  on public.accounts for insert
  with check (auth.uid() = owner_id);

create policy "accounts_update"
  on public.accounts for update
  using (public.is_account_member(id));

create policy "profiles_select"
  on public.profiles for select
  using (auth.uid() = user_id or public.is_account_member(
    (select account_id from public.account_members where user_id = public.profiles.user_id limit 1)
  ));

create policy "profiles_insert"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_update"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "account_members_select"
  on public.account_members for select
  using (auth.uid() = user_id);

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

create policy "invites_select"
  on public.invites for select
  using (public.is_account_member(account_id));

create policy "invites_insert"
  on public.invites for insert
  with check (public.is_account_member(account_id));

create policy "invites_update"
  on public.invites for update
  using (public.is_account_member(account_id));

create policy "api_keys_select"
  on public.api_keys for select
  using (public.is_account_member(account_id));

create policy "api_keys_insert"
  on public.api_keys for insert
  with check (public.is_account_member(account_id));

create policy "api_keys_update"
  on public.api_keys for update
  using (public.is_account_member(account_id));

create policy "subscriptions_select"
  on public.subscriptions for select
  using (public.is_account_member(account_id));

create or replace function public.accept_invites()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_user uuid;
  v_count integer := 0;
begin
  v_user := auth.uid();
  v_email := lower(auth.jwt() ->> 'email');
  if v_user is null or v_email is null then
    return 0;
  end if;

  insert into public.account_members (account_id, user_id, role)
  select i.account_id, v_user, i.role
  from public.invites i
  where lower(i.email) = v_email and i.status = 'pending'
  on conflict (account_id, user_id) do nothing;

  get diagnostics v_count = row_count;

  update public.invites
  set status = 'accepted', accepted_at = now()
  where lower(email) = v_email and status = 'pending';

  return v_count;
end;
$$;
