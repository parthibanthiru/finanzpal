-- Run once in Supabase → SQL Editor.
-- Creates a public profile row for every new user, protects it with Row Level Security,
-- and adds a function so users can delete their own account (GDPR Art. 17).

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on sign-up (name comes from signUp options.data.full_name)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    -- e-mail sign-up and Google set full_name; some providers only set name
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Let a logged-in user delete their own account (profile is removed via ON DELETE CASCADE)
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

-- ─────────────────────────────────────────────────────────────
-- v0.2: chat history (one thread per user)
-- Safe to run again on an existing project.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('user', 'bot')),
  content     text not null check (char_length(content) <= 8000),
  created_at  timestamptz not null default now()
);

create index if not exists messages_user_id_idx on public.messages (user_id, id);

alter table public.messages enable row level security;

drop policy if exists "Users read own messages" on public.messages;
create policy "Users read own messages"
  on public.messages for select using (auth.uid() = user_id);

drop policy if exists "Users insert own messages" on public.messages;
create policy "Users insert own messages"
  on public.messages for insert with check (auth.uid() = user_id);

drop policy if exists "Users delete own messages" on public.messages;
create policy "Users delete own messages"
  on public.messages for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- v0.7: Merkliste (saved providers, synced across the user's devices)
-- Safe to run again on an existing project.
-- category = app comparison id (e.g. 'girokonto', 'broker', 'haftpflicht'),
-- item_id  = the provider's id in the website's data/*.json
-- ─────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  user_id     uuid not null references auth.users(id) on delete cascade,
  category    text not null check (char_length(category) <= 40),
  item_id     text not null check (char_length(item_id) <= 80),
  created_at  timestamptz not null default now(),
  primary key (user_id, category, item_id)
);

alter table public.favorites enable row level security;

drop policy if exists "Users read own favorites" on public.favorites;
create policy "Users read own favorites"
  on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "Users insert own favorites" on public.favorites;
create policy "Users insert own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);

drop policy if exists "Users delete own favorites" on public.favorites;
create policy "Users delete own favorites"
  on public.favorites for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- v0.12: push notifications ("Neue Anbieter und Ratgeber", opt-in in Profil)
-- Safe to run again on an existing project.
-- One row per device. The app only goes through the two functions below (a shared phone
-- simply moves to whoever switched notifications on last); the sender in
-- .github/workflows/push-notify.yml reads the table with the service-role key.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.push_tokens (
  token       text primary key check (char_length(token) <= 200),
  user_id     uuid not null references auth.users(id) on delete cascade,
  lang        text not null default 'de' check (lang in ('de', 'en')),
  platform    text not null default '' check (char_length(platform) <= 20),
  updated_at  timestamptz not null default now()
);

alter table public.push_tokens enable row level security;

drop policy if exists "Users read own push tokens" on public.push_tokens;
create policy "Users read own push tokens"
  on public.push_tokens for select using (auth.uid() = user_id);

create or replace function public.register_push_token(p_token text, p_lang text, p_platform text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.push_tokens (token, user_id, lang, platform, updated_at)
  values (p_token, auth.uid(), case when p_lang = 'en' then 'en' else 'de' end, coalesce(p_platform, ''), now())
  on conflict (token) do update
    set user_id = excluded.user_id, lang = excluded.lang, platform = excluded.platform, updated_at = now();
end;
$$;

create or replace function public.unregister_push_token(p_token text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from public.push_tokens where token = p_token and user_id = auth.uid();
end;
$$;

revoke all on function public.register_push_token(text, text, text) from public, anon;
grant execute on function public.register_push_token(text, text, text) to authenticated;
revoke all on function public.unregister_push_token(text) from public, anon;
grant execute on function public.unregister_push_token(text) to authenticated;
