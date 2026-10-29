create table public.entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('projects','writing','3d','recognition')),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 180),
  description text not null default '' check (char_length(description) <= 2000),
  tags text[] not null default '{}',
  image_path text,
  markdown_path text,
  markdown text not null default '',
  date_label text not null default '',
  date date,
  link text check (link is null or link ~ '^https?://'),
  github_url text check (github_url is null or github_url ~ '^https?://'),
  status text not null default 'building' check (status in ('shipped','building','concept','ready')),
  original boolean not null default true,
  position integer not null default 0,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dated_entries check (not published or kind not in ('writing','recognition') or date is not null),
  constraint writing_destination check (not published or kind <> 'writing' or link is not null),
  constraint published_image check (not published or kind = 'writing' or image_path is not null)
);
create index entries_public_order on public.entries (kind,published,position,date desc);
alter table public.entries enable row level security;
grant select on public.entries to anon;
grant select,insert,update,delete on public.entries to authenticated;
revoke all on public.entries from public;
create policy "Public reads published entries" on public.entries for select to anon using (published);
create policy "Signed in reads published or own drafts" on public.entries for select to authenticated using (published or (select auth.uid())='ca3574a5-1789-4012-910c-42f85a513b9b'::uuid);
create policy "Only Rishit inserts entries" on public.entries for insert to authenticated with check ((select auth.uid())='ca3574a5-1789-4012-910c-42f85a513b9b'::uuid);
create policy "Only Rishit updates entries" on public.entries for update to authenticated using ((select auth.uid())='ca3574a5-1789-4012-910c-42f85a513b9b'::uuid) with check ((select auth.uid())='ca3574a5-1789-4012-910c-42f85a513b9b'::uuid);
create policy "Only Rishit deletes entries" on public.entries for delete to authenticated using ((select auth.uid())='ca3574a5-1789-4012-910c-42f85a513b9b'::uuid);

create function public.touch_entry() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
revoke execute on function public.touch_entry() from public,anon,authenticated;
create trigger touch_entry before update on public.entries for each row execute function public.touch_entry();

create function public.order_entries(entry_ids uuid[], entry_kind text) returns void
language plpgsql security invoker set search_path = '' as $$
declare item uuid; ordinal integer := 0;
begin
  if (select auth.uid()) is distinct from 'ca3574a5-1789-4012-910c-42f85a513b9b'::uuid then raise exception 'Not authorised'; end if;
  if entry_kind not in ('projects','3d') then raise exception 'This section is date ordered'; end if;
  foreach item in array entry_ids loop
    update public.entries set position=ordinal where id=item and kind=entry_kind;
    ordinal := ordinal + 1;
  end loop;
end; $$;
revoke execute on function public.order_entries(uuid[],text) from public,anon;
grant execute on function public.order_entries(uuid[],text) to authenticated;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio','portfolio',false,15728640,array['image/jpeg','image/png','image/webp','image/avif','text/markdown','text/plain','application/octet-stream']);

create policy "Read published media or own drafts" on storage.objects for select to anon,authenticated using (
  bucket_id='portfolio' and (
    (select auth.uid())='ca3574a5-1789-4012-910c-42f85a513b9b'::uuid or
    exists (select 1 from public.entries e where e.published and (e.image_path=name or e.markdown_path=name))
  )
);
create policy "Only Rishit uploads" on storage.objects for insert to authenticated with check (
  bucket_id='portfolio' and (select auth.uid())='ca3574a5-1789-4012-910c-42f85a513b9b'::uuid and
  (storage.foldername(name))[1]='ca3574a5-1789-4012-910c-42f85a513b9b'
);
create policy "Only Rishit updates files" on storage.objects for update to authenticated using (
  bucket_id='portfolio' and (select auth.uid())='ca3574a5-1789-4012-910c-42f85a513b9b'::uuid
) with check (bucket_id='portfolio' and (select auth.uid())='ca3574a5-1789-4012-910c-42f85a513b9b'::uuid and (storage.foldername(name))[1]='ca3574a5-1789-4012-910c-42f85a513b9b');
create policy "Only Rishit deletes files" on storage.objects for delete to authenticated using (
  bucket_id='portfolio' and (select auth.uid())='ca3574a5-1789-4012-910c-42f85a513b9b'::uuid
);
