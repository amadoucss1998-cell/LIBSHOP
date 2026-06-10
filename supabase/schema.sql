-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone_number text,
  whatsapp_number text,
  location text default 'Monrovia',
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Categories table
create table if not exists categories (
  id serial primary key,
  name text not null unique,
  icon text not null,
  slug text not null unique
);

-- Insert default categories (skip if already exist)
insert into categories (name, icon, slug) values
  ('Electronics', '📱', 'electronics'),
  ('Vehicles', '🚗', 'vehicles'),
  ('Fashion', '👗', 'fashion'),
  ('Furniture', '🛋️', 'furniture'),
  ('Real Estate', '🏠', 'real-estate'),
  ('Farm & Food', '🌽', 'farm-food'),
  ('Services', '🔧', 'services'),
  ('Jobs', '💼', 'jobs'),
  ('Other', '📦', 'other')
on conflict (slug) do nothing;

-- Listings table
create table if not exists listings (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  price numeric(10,2) not null,
  is_negotiable boolean default false,
  category_id integer references categories(id) not null,
  condition text check (condition in ('New', 'Like New', 'Good', 'Fair', 'For Parts')) not null,
  location text default 'Monrovia',
  county text default 'Montserrado',
  images text[] default '{}',
  is_sold boolean default false,
  is_active boolean default true,
  view_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, ''))
  ) stored
);

-- Indexes (safe to re-run)
create index if not exists listings_search_idx on listings using gin(search_vector);
create index if not exists listings_category_idx on listings(category_id);
create index if not exists listings_seller_idx on listings(seller_id);
create index if not exists listings_created_idx on listings(created_at desc);

-- Saved/Favorites table
create table if not exists saved_listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, listing_id)
);

-- Row Level Security
alter table profiles enable row level security;
alter table listings enable row level security;
alter table saved_listings enable row level security;

-- Profiles policies
do $$ begin
  create policy "Public profiles are viewable by everyone" on profiles for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
exception when duplicate_object then null; end $$;

-- Listings policies
do $$ begin
  create policy "Listings are viewable by everyone" on listings for select using (is_active = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Authenticated users can create listings" on listings for insert with check (auth.uid() = seller_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Sellers can update own listings" on listings for update using (auth.uid() = seller_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Sellers can delete own listings" on listings for delete using (auth.uid() = seller_id);
exception when duplicate_object then null; end $$;

-- Saved listings policies
do $$ begin
  create policy "Users can view own saved listings" on saved_listings for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can save listings" on saved_listings for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can unsave listings" on saved_listings for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
