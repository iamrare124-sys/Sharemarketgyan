-- Run this in Supabase SQL Editor

create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  excerpt text,
  content jsonb,
  category text not null,
  tags text[] default '{}',
  cover_image text,
  cover_image_alt text,
  author_name text,
  author_title text,
  meta_title text,
  meta_description text,
  schema_json jsonb,
  live_data jsonb,
  reading_time int default 5,
  word_count int default 800,
  ai_score int default 7,
  published boolean default true,
  tweeted boolean default false,
  views int default 0,
  source_url text,
  source_headline text,
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists posts_slug_idx on posts(slug);
create index if not exists posts_category_idx on posts(category);
create index if not exists posts_created_idx on posts(created_at desc);
create index if not exists posts_published_idx on posts(published);
create index if not exists posts_source_url_idx on posts(source_url);

alter table posts enable row level security;

create policy "Public read" on posts for select using (published = true);
create policy "Service insert" on posts for insert with check (true);
create policy "Service update" on posts for update using (true);
create policy "Service delete" on posts for delete using (true);
