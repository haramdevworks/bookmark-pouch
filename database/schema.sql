-- 파우치 (BolPocket) - 1차 데이터베이스 스키마
-- Supabase SQL Editor에서 그대로 실행 가능한 DDL입니다.
-- 2차(OG 메타데이터), 3차(AI) 단계에서 컬럼이 추가될 수 있습니다.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- folders
-- ---------------------------------------------------------------------------
create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- bookmarks
-- ---------------------------------------------------------------------------
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text not null default '제목 없음',
  description text,
  thumbnail text,
  site_name text,
  author text,
  published_at timestamptz,
  content_type text,
  memo text,
  folder_id uuid references public.folders (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookmarks_folder_id_idx on public.bookmarks (folder_id);
create index if not exists bookmarks_created_at_idx on public.bookmarks (created_at desc);

-- ---------------------------------------------------------------------------
-- 4차: Gemini AI 분석 결과 (신규 북마크 저장 후 백그라운드에서 채워짐)
-- 기존 행은 세 컬럼 모두 NULL로 유지되며 기존 데이터는 영향받지 않는다.
-- ---------------------------------------------------------------------------
alter table public.bookmarks
  add column if not exists summary text,
  add column if not exists quotes text[],
  add column if not exists ai_tags text[];

-- ---------------------------------------------------------------------------
-- bookmark_tags (bookmarks <-> tags 다대다 관계)
-- ---------------------------------------------------------------------------
create table if not exists public.bookmark_tags (
  bookmark_id uuid not null references public.bookmarks (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (bookmark_id, tag_id)
);

create index if not exists bookmark_tags_tag_id_idx on public.bookmark_tags (tag_id);

-- ---------------------------------------------------------------------------
-- bookmarks.updated_at 자동 갱신 트리거
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_bookmarks_updated_at on public.bookmarks;

create trigger set_bookmarks_updated_at
  before update on public.bookmarks
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- 2차 시점에는 로그인/회원 기능이 없어 사용자 구분이 불가능하므로,
-- publishable(anon) key로 모든 행에 접근할 수 있는 최소 공개 정책만 둔다.
-- 이후 로그인 기능이 추가되면 사용자 소유 여부에 따라 정책을 좁혀야 한다.
-- ---------------------------------------------------------------------------
alter table public.folders enable row level security;
alter table public.tags enable row level security;
alter table public.bookmarks enable row level security;
alter table public.bookmark_tags enable row level security;

drop policy if exists "Public access" on public.folders;
create policy "Public access" on public.folders
  for all using (true) with check (true);

drop policy if exists "Public access" on public.tags;
create policy "Public access" on public.tags
  for all using (true) with check (true);

drop policy if exists "Public access" on public.bookmarks;
create policy "Public access" on public.bookmarks
  for all using (true) with check (true);

drop policy if exists "Public access" on public.bookmark_tags;
create policy "Public access" on public.bookmark_tags
  for all using (true) with check (true);

-- ---------------------------------------------------------------------------
-- 5차: 검색
-- title/description/url/site_name/memo/content_type/summary는 일반 컬럼이라
-- PostgREST의 ilike 필터로 바로 검색할 수 있지만, quotes/ai_tags는 text[] 배열이라
-- 배열 원소 단위의 부분 일치 검색을 PostgREST 연산자만으로 표현할 수 없다.
-- 이를 위해 unnest + ilike로 배열까지 포함해 검색하는 함수를 하나 둔다.
-- RLS는 함수를 SECURITY INVOKER(기본값)로 두어 호출자 권한 그대로 적용되게 한다.
-- ---------------------------------------------------------------------------
create or replace function public.search_bookmark_ids(search_term text)
returns table (id uuid)
language sql
stable
as $$
  select b.id
  from public.bookmarks b
  where
    b.title ilike '%' || search_term || '%'
    or b.description ilike '%' || search_term || '%'
    or b.url ilike '%' || search_term || '%'
    or b.site_name ilike '%' || search_term || '%'
    or b.memo ilike '%' || search_term || '%'
    or b.content_type ilike '%' || search_term || '%'
    or b.summary ilike '%' || search_term || '%'
    or exists (select 1 from unnest(b.quotes) as quote where quote ilike '%' || search_term || '%')
    or exists (select 1 from unnest(b.ai_tags) as tag where tag ilike '%' || search_term || '%');
$$;

grant execute on function public.search_bookmark_ids(text) to anon, authenticated;
