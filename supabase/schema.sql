-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone_number text,
  whatsapp_number text,
  location text default 'Monrovia',
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ─────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────
create table if not exists categories (
  id serial primary key,
  name text not null unique,
  icon text not null,
  slug text not null unique,
  sort_order integer default 99
);

alter table categories add column if not exists sort_order integer default 99;

insert into categories (name, icon, slug, sort_order) values
  ('Electronics', '📱', 'electronics', 1),
  ('Vehicles',    '🚗', 'vehicles',    2),
  ('Fashion',     '👗', 'fashion',     3),
  ('Furniture',   '🛋️', 'furniture',   4),
  ('Real Estate', '🏠', 'real-estate', 5),
  ('Farm & Food', '🌽', 'farm-food',   6),
  ('Services',    '🔧', 'services',    7),
  ('Jobs',        '💼', 'jobs',        8),
  ('Other',       '📦', 'other',       9)
on conflict (slug) do nothing;

-- ─────────────────────────────────────────
-- LISTINGS
-- ─────────────────────────────────────────
create table if not exists listings (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references profiles(id) on delete cascade not null,
  title text not null check (char_length(title) between 3 and 150),
  description text not null check (char_length(description) between 10 and 3000),
  price numeric(10,2) not null check (price >= 0 and price <= 999999),
  is_negotiable boolean default false,
  category_id integer references categories(id) not null,
  condition text check (condition in ('New', 'Like New', 'Good', 'Fair', 'For Parts')) not null,
  location text not null default 'Monrovia',
  county text not null default 'Montserrado',
  images text[] default '{}',
  is_sold boolean default false,
  is_active boolean default true,
  view_count integer default 0,
  save_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  search_vector tsvector generated always as (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(location, '')
    )
  ) stored
);

create index if not exists listings_search_idx  on listings using gin(search_vector);
create index if not exists listings_category_idx on listings(category_id);
create index if not exists listings_seller_idx   on listings(seller_id);
create index if not exists listings_created_idx  on listings(created_at desc);
create index if not exists listings_active_idx   on listings(is_active, is_sold, created_at desc);

-- auto-update updated_at on listings
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_updated_at on listings;
create trigger listings_updated_at
  before update on listings
  for each row execute procedure update_updated_at();

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

-- ─────────────────────────────────────────
-- SAVED LISTINGS
-- ─────────────────────────────────────────
create table if not exists saved_listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, listing_id)
);

create index if not exists saved_user_idx on saved_listings(user_id);

-- keep save_count in sync
create or replace function update_save_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update listings set save_count = save_count + 1 where id = new.listing_id;
  elsif TG_OP = 'DELETE' then
    update listings set save_count = greatest(save_count - 1, 0) where id = old.listing_id;
  end if;
  return null;
end;
$$;

drop trigger if exists saved_listings_count on saved_listings;
create trigger saved_listings_count
  after insert or delete on saved_listings
  for each row execute procedure update_save_count();

-- ─────────────────────────────────────────
-- VIEW LOGS (deduplication — 1 per user+listing per day)
-- ─────────────────────────────────────────
create table if not exists listing_views (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references listings(id) on delete cascade not null,
  viewer_id uuid references profiles(id) on delete set null,
  viewer_ip text,
  viewed_at timestamp with time zone default now(),
  unique(listing_id, viewer_id),           -- logged-in dedup
  constraint views_need_identifier check (viewer_id is not null or viewer_ip is not null)
);

create index if not exists views_listing_idx on listing_views(listing_id);

-- keep view_count in sync
create or replace function update_view_count()
returns trigger language plpgsql as $$
begin
  update listings set view_count = view_count + 1 where id = new.listing_id;
  return null;
end;
$$;

drop trigger if exists listing_views_count on listing_views;
create trigger listing_views_count
  after insert on listing_views
  for each row execute procedure update_view_count();

-- ─────────────────────────────────────────
-- REPORTS (abuse / spam)
-- ─────────────────────────────────────────
create table if not exists reports (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references listings(id) on delete cascade not null,
  reporter_id uuid references profiles(id) on delete set null,
  reason text not null check (reason in ('spam','misleading','prohibited','offensive','scam','other')),
  details text,
  resolved boolean default false,
  created_at timestamp with time zone default now()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
alter table profiles       enable row level security;
alter table listings       enable row level security;
alter table saved_listings enable row level security;
alter table listing_views  enable row level security;
alter table reports        enable row level security;

-- Profiles
do $$ begin create policy "profiles_public_read"  on profiles for select using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "profiles_own_insert"   on profiles for insert with check (auth.uid() = id); exception when duplicate_object then null; end $$;
do $$ begin create policy "profiles_own_update"   on profiles for update using (auth.uid() = id); exception when duplicate_object then null; end $$;

-- Listings
do $$ begin create policy "listings_public_read"  on listings for select using (is_active = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "listings_auth_insert"  on listings for insert with check (auth.uid() = seller_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "listings_own_update"   on listings for update using (auth.uid() = seller_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "listings_own_delete"   on listings for delete using (auth.uid() = seller_id); exception when duplicate_object then null; end $$;

-- Saved listings
do $$ begin create policy "saved_own_read"   on saved_listings for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "saved_own_insert" on saved_listings for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "saved_own_delete" on saved_listings for delete using (auth.uid() = user_id); exception when duplicate_object then null; end $$;

-- View logs (insert-only for authenticated users or anon via server)
do $$ begin create policy "views_auth_insert" on listing_views for insert with check (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "views_own_read"    on listing_views for select using (auth.uid() = viewer_id); exception when duplicate_object then null; end $$;

-- Reports
do $$ begin create policy "reports_auth_insert" on reports for insert with check (auth.uid() = reporter_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "reports_own_read"    on reports for select using (auth.uid() = reporter_id); exception when duplicate_object then null; end $$;
