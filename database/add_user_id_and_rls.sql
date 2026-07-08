-- 사용자별 데이터 격리: user_id 컬럼 추가 & RLS 정책 수정
-- Supabase SQL Editor에서 실행

-- ---------------------------------------------------------------------------
-- 1. folders 테이블에 user_id 추가
-- ---------------------------------------------------------------------------
alter table public.folders
  add column if not exists user_id uuid not null default auth.uid();

alter table public.folders
  add constraint folders_user_id_fk
    foreign key (user_id) references auth.users (id) on delete cascade;

create index if not exists folders_user_id_idx on public.folders (user_id);

-- ---------------------------------------------------------------------------
-- 2. tags 테이블에 user_id 추가
-- ---------------------------------------------------------------------------
alter table public.tags
  add column if not exists user_id uuid not null default auth.uid();

alter table public.tags
  add constraint tags_user_id_fk
    foreign key (user_id) references auth.users (id) on delete cascade;

create index if not exists tags_user_id_idx on public.tags (user_id);

-- unique 제약 조건 수정 (user_id + name)
alter table public.tags drop constraint if exists tags_name_key;
create unique index if not exists tags_user_id_name_idx on public.tags (user_id, name);

-- ---------------------------------------------------------------------------
-- 3. bookmarks 테이블에 user_id 추가
-- ---------------------------------------------------------------------------
alter table public.bookmarks
  add column if not exists user_id uuid not null default auth.uid();

alter table public.bookmarks
  add constraint bookmarks_user_id_fk
    foreign key (user_id) references auth.users (id) on delete cascade;

create index if not exists bookmarks_user_id_idx on public.bookmarks (user_id);

-- ---------------------------------------------------------------------------
-- 4. RLS 정책 수정 - 각 사용자가 자신의 데이터만 접근
-- ---------------------------------------------------------------------------
drop policy if exists "Public access" on public.folders;
drop policy if exists "Public access" on public.tags;
drop policy if exists "Public access" on public.bookmarks;
drop policy if exists "Public access" on public.bookmark_tags;

-- folders: 사용자가 자신의 폴더만 접근
create policy "Users can view own folders" on public.folders
  for select using (user_id = auth.uid());

create policy "Users can insert own folders" on public.folders
  for insert with check (user_id = auth.uid());

create policy "Users can update own folders" on public.folders
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can delete own folders" on public.folders
  for delete using (user_id = auth.uid());

-- tags: 사용자가 자신의 태그만 접근
create policy "Users can view own tags" on public.tags
  for select using (user_id = auth.uid());

create policy "Users can insert own tags" on public.tags
  for insert with check (user_id = auth.uid());

create policy "Users can update own tags" on public.tags
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can delete own tags" on public.tags
  for delete using (user_id = auth.uid());

-- bookmarks: 사용자가 자신의 북마크만 접근
create policy "Users can view own bookmarks" on public.bookmarks
  for select using (user_id = auth.uid());

create policy "Users can insert own bookmarks" on public.bookmarks
  for insert with check (user_id = auth.uid());

create policy "Users can update own bookmarks" on public.bookmarks
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can delete own bookmarks" on public.bookmarks
  for delete using (user_id = auth.uid());

-- bookmark_tags: 사용자가 자신의 북마크에만 태그 추가 가능
create policy "Users can view own bookmark_tags" on public.bookmark_tags
  for select using (
    exists (
      select 1 from public.bookmarks
      where bookmarks.id = bookmark_tags.bookmark_id
      and bookmarks.user_id = auth.uid()
    )
  );

create policy "Users can insert own bookmark_tags" on public.bookmark_tags
  for insert with check (
    exists (
      select 1 from public.bookmarks
      where bookmarks.id = bookmark_tags.bookmark_id
      and bookmarks.user_id = auth.uid()
    )
  );

create policy "Users can delete own bookmark_tags" on public.bookmark_tags
  for delete using (
    exists (
      select 1 from public.bookmarks
      where bookmarks.id = bookmark_tags.bookmark_id
      and bookmarks.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 5. search_bookmark_ids 함수 업데이트 - user_id 필터링 추가
-- ---------------------------------------------------------------------------
create or replace function public.search_bookmark_ids(search_term text)
returns table (id uuid)
language sql
stable
as $$
  select b.id
  from public.bookmarks b
  where
    b.user_id = auth.uid()
    and (
      b.title ilike '%' || search_term || '%'
      or b.description ilike '%' || search_term || '%'
      or b.url ilike '%' || search_term || '%'
      or b.site_name ilike '%' || search_term || '%'
      or b.memo ilike '%' || search_term || '%'
      or b.content_type ilike '%' || search_term || '%'
      or b.summary ilike '%' || search_term || '%'
      or exists (select 1 from unnest(b.quotes) as quote where quote ilike '%' || search_term || '%')
      or exists (select 1 from unnest(b.ai_tags) as tag where tag ilike '%' || search_term || '%')
    );
$$;
