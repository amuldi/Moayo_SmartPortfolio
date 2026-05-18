-- Moayo production-ready relational schema draft.
-- Apply with Neon, Supabase Postgres, or another managed Postgres provider.

create extension if not exists citext;

create table if not exists schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists users (
  id text primary key,
  username text not null,
  email citext not null unique,
  password_hash text,
  email_verified boolean not null default false,
  verification_token text,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists oauth_identities (
  id bigserial primary key,
  user_id text not null references users(id) on delete cascade,
  provider text not null check (provider in ('google', 'naver', 'kakao')),
  provider_user_id text not null,
  created_at timestamptz not null default now(),
  unique (provider, provider_user_id)
);

create table if not exists sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  refresh_token_hash text not null unique,
  user_agent text not null default '',
  ip_address text not null default '',
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  rotated_at timestamptz not null default now()
);

create table if not exists portfolios (
  id text primary key,
  client_id text not null default 'default',
  user_id text not null references users(id) on delete cascade,
  name text not null,
  preferences jsonb not null default '{}'::jsonb,
  recent_tickers jsonb not null default '[]'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create table if not exists accounts (
  id text primary key,
  client_id text not null default 'default',
  portfolio_id text not null references portfolios(id) on delete cascade,
  name text not null,
  type text not null check (type in ('ISA', 'PENSION', 'BROKERAGE', 'CMA', 'GOLD')),
  base_currency text not null default 'KRW',
  total_capital numeric(18, 2) not null default 0,
  memo text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists holdings (
  id text primary key,
  client_id text not null default 'default',
  account_id text not null references accounts(id) on delete cascade,
  ticker text not null,
  name text not null,
  sector text not null default '기타',
  region text not null default '기타',
  market text not null default '기타',
  asset_class text not null default 'equity',
  currency text not null default 'KRW',
  category text not null default '기타',
  quantity numeric(24, 8) not null default 0,
  avg_price numeric(18, 4) not null default 0,
  current_price numeric(18, 4) not null default 0,
  purchase_amount numeric(18, 2) not null default 0,
  market_value numeric(18, 2) not null default 0,
  pnl numeric(18, 2) not null default 0,
  return_pct numeric(9, 4) not null default 0,
  target_weight numeric(6, 2) not null default 0,
  memo text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, ticker)
);

create table if not exists watchlist_items (
  id bigserial primary key,
  portfolio_id text not null references portfolios(id) on delete cascade,
  ticker text not null,
  name text not null,
  added_at timestamptz not null default now(),
  unique (portfolio_id, ticker)
);

create table if not exists rebalancing_runs (
  id text primary key,
  portfolio_id text not null references portfolios(id) on delete cascade,
  selected_profile text not null,
  target_model text,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists app_events (
  id bigserial primary key,
  user_id text references users(id) on delete set null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table users add column if not exists disabled_at timestamptz;
alter table portfolios add column if not exists recent_tickers jsonb not null default '[]'::jsonb;
alter table portfolios add column if not exists client_id text default 'default';
update portfolios
set client_id = case
  when id like user_id || ':%' then split_part(id, ':', 2)
  else id
end
where client_id is null or client_id = 'default';
alter table portfolios alter column client_id set not null;
create unique index if not exists idx_portfolios_user_client_id on portfolios(user_id, client_id);
alter table accounts add column if not exists client_id text default 'default';
update accounts set client_id = id where client_id is null or client_id = 'default';
alter table accounts alter column client_id set not null;
create unique index if not exists idx_accounts_portfolio_client_id on accounts(portfolio_id, client_id);
alter table holdings add column if not exists client_id text default 'default';
update holdings set client_id = id where client_id is null or client_id = 'default';
alter table holdings alter column client_id set not null;
create unique index if not exists idx_holdings_account_client_id on holdings(account_id, client_id);
alter table oauth_identities drop constraint if exists oauth_identities_provider_check;
alter table oauth_identities add constraint oauth_identities_provider_check check (provider in ('google', 'naver', 'kakao'));

create index if not exists idx_portfolios_user_id on portfolios(user_id);
create index if not exists idx_accounts_portfolio_id on accounts(portfolio_id);
create index if not exists idx_holdings_account_id on holdings(account_id);
create index if not exists idx_watchlist_portfolio_id on watchlist_items(portfolio_id);
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_sessions_refresh_token_hash on sessions(refresh_token_hash);
create index if not exists idx_app_events_type_created_at on app_events(type, created_at desc);

insert into schema_migrations (version) values ('001_public_beta_foundation')
on conflict (version) do nothing;

insert into schema_migrations (version) values ('002_client_ids_for_nested_snapshots')
on conflict (version) do nothing;
