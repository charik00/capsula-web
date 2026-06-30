-- ============================================================
-- Capsula — полная инициализация НОВОГО проекта Supabase.
-- Dashboard -> SQL Editor -> New query -> вставить всё -> Run.
-- Безопасно запускать повторно (IF NOT EXISTS / IF EXISTS).
-- ============================================================

-- 1. Заявки с лендинга (контактная форма)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- 2. Медитации (audio_url = путь в приватном бакете media)
create table if not exists public.meditations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  audio_url text not null,
  created_at timestamptz not null default now()
);

-- 3. Доступ клиента к медитации (срок задаёт админ в днях)
create table if not exists public.user_access (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  meditation_id uuid not null references public.meditations(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- 4. Белый список клиентов (кто может войти в кабинет)
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. Анкеты (ответы клиентов; видит только админ)
create table if not exists public.questionnaires (
  id uuid primary key default gen_random_uuid(),
  client_email text not null,
  contact text,
  program text,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.questionnaires add column if not exists contact text;
alter table public.questionnaires add column if not exists program text;

-- 6. Комментарии специалистов по клиенту (видит только админ)
create table if not exists public.client_notes (
  id uuid primary key default gen_random_uuid(),
  client_email text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- 7. Файлы клиента: диеты, инструкции, документы (приватный бакет media)
create table if not exists public.client_files (
  id uuid primary key default gen_random_uuid(),
  client_email text not null,
  title text not null,
  kind text not null default 'document',
  path text not null,
  created_at timestamptz not null default now()
);
-- материал может быть ссылкой (kind='link': url вместо файла) или видео.
-- поэтому url добавляем, а path делаем необязательным.
alter table public.client_files add column if not exists url text;
alter table public.client_files alter column path drop not null;

alter table public.client_notes enable row level security;
alter table public.client_files enable row level security;
-- политик нет: доступ только через service_role (серверный код)

-- ============================================================
-- RLS. Серверный код ходит под service_role и RLS обходит.
-- ============================================================
alter table public.leads          enable row level security;
alter table public.meditations    enable row level security;
alter table public.user_access    enable row level security;
alter table public.clients        enable row level security;
alter table public.questionnaires enable row level security;

-- leads: лендинг шлёт заявку и админка читает их через anon-клиент,
-- поэтому оставляем anon insert + select (как было в старом проекте).
drop policy if exists "leads anon insert" on public.leads;
drop policy if exists "leads anon select" on public.leads;
create policy "leads anon insert" on public.leads
  for insert to anon with check (true);
create policy "leads anon select" on public.leads
  for select to anon using (true);

-- clients: аутентифицированный видит только свою строку.
drop policy if exists "clients self select" on public.clients;
create policy "clients self select" on public.clients
  for select to authenticated
  using (email = auth.jwt() ->> 'email');

-- meditations / user_access / questionnaires: политик НЕ создаём —
-- доступ только через service_role (серверные экшены и API-роут).

-- ============================================================
-- 8. Прослушивания медитаций (для админки: видеть, что реально слушают)
-- ============================================================
create table if not exists public.listen_events (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  meditation_id uuid not null references public.meditations(id) on delete cascade,
  kind text not null default 'play',  -- 'play' = начал слушать; 'complete' = дослушал до конца
  created_at timestamptz not null default now()
);
create index if not exists listen_events_user_med_idx
  on public.listen_events (user_email, meditation_id);
alter table public.listen_events enable row level security;
-- политик нет: запись и чтение только через service_role (серверный код)

-- 6. Приватный бакет для медитаций/документов
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do update set public = false;

-- Готово. Проверь: 5 таблиц в public и бакет 'media' (Private).
