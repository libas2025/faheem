-- ==============================================================================
-- LIBAS TAILOR — SECURE PRIVATE GALLERY PUBLISHING SYSTEM
-- Supabase PostgreSQL Schema, Strict RLS Policies & Storage Security
-- Target Admin Email: libastailor0@gmail.com
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ADMIN USERS TABLE (AUTHORIZATION LAYER)
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz default now() not null
);

-- 3. GALLERY IMAGES TABLE (DATA MINIMIZATION: NO TITLE, NO DESCRIPTION)
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text,
  is_published boolean default false not null,
  created_at timestamptz default now() not null,
  published_at timestamptz,
  uploaded_by uuid references auth.users(id) on delete set null
);

-- Index for high-performance public query ordering: published_at DESC
create index if not exists idx_gallery_images_published
  on public.gallery_images (published_at desc)
  where is_published = true;

create index if not exists idx_gallery_images_created
  on public.gallery_images (created_at desc);

-- 4. SECURITY DEFINER HELPER FUNCTION (AVOIDS RECURSIVE RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- 5. ROW LEVEL SECURITY (RLS) FOR TABLES
alter table public.admin_users enable row level security;
alter table public.gallery_images enable row level security;

-- Admin Users Policies
drop policy if exists "Users can read own admin status" on public.admin_users;
create policy "Users can read own admin status"
  on public.admin_users
  for select
  using (user_id = auth.uid());

-- Gallery Images Policies:
-- 5.1 Public Read (ONLY published images) + Admin Read (all images)
drop policy if exists "Public can view published gallery images" on public.gallery_images;
create policy "Public can view published gallery images"
  on public.gallery_images
  for select
  using (is_published = true or public.is_admin());

-- 5.2 Admin Insert (only authorized admin can create records)
drop policy if exists "Admin can insert gallery images" on public.gallery_images;
create policy "Admin can insert gallery images"
  on public.gallery_images
  for insert
  with check (public.is_admin() and uploaded_by = auth.uid());

-- 5.3 Admin Update (publish/unpublish)
drop policy if exists "Admin can update gallery images" on public.gallery_images;
create policy "Admin can update gallery images"
  on public.gallery_images
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- 5.4 Admin Delete
drop policy if exists "Admin can delete gallery images" on public.gallery_images;
create policy "Admin can delete gallery images"
  on public.gallery_images
  for delete
  using (public.is_admin());

-- 6. AUTOMATIC ADMIN REGISTRATION TRIGGER FOR libastailor0@gmail.com
create or replace function public.handle_admin_user_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(new.email) = 'libastailor0@gmail.com' then
    insert into public.admin_users (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_admin on auth.users;
create trigger on_auth_user_created_admin
  after insert or update on auth.users
  for each row execute function public.handle_admin_user_registration();

-- Seed existing user if already created in auth.users
insert into public.admin_users (user_id, role)
select id, 'admin'
from auth.users
where lower(email) = 'libastailor0@gmail.com'
on conflict (user_id) do update set role = 'admin';

-- Direct assignment with verified UID
insert into public.admin_users (user_id, role)
values ('76cf9a6b-5501-40ba-b935-92046099b9e4', 'admin')
on conflict (user_id) do update set role = 'admin';

-- 7. SUPABASE STORAGE BUCKET CONFIGURATION (STRICT < 2MB & JPG/PNG ONLY)
-- 2097151 bytes = 2MB - 1 byte (strictly less than 2MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  2097151,
  array['image/jpeg', 'image/png', 'image/jpg']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 2097151,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/jpg'];

-- 8. STORAGE RLS POLICIES
drop policy if exists "Public can view gallery objects" on storage.objects;
create policy "Public can view gallery objects"
  on storage.objects
  for select
  using (bucket_id = 'gallery');

drop policy if exists "Admin can upload gallery objects" on storage.objects;
create policy "Admin can upload gallery objects"
  on storage.objects
  for insert
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admin can update gallery objects" on storage.objects;
create policy "Admin can update gallery objects"
  on storage.objects
  for update
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admin can delete gallery objects" on storage.objects;
create policy "Admin can delete gallery objects"
  on storage.objects
  for delete
  using (bucket_id = 'gallery' and public.is_admin());
