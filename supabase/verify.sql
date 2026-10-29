-- All fixtures and role changes roll back. This verifies database enforcement.
begin;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"ca3574a5-1789-4012-910c-42f85a513b9b","role":"authenticated"}',true);
insert into public.entries(kind,slug,title,published,image_path) values
('projects','rls-private-test','[TEST] private',false,'ca3574a5-1789-4012-910c-42f85a513b9b/private-test.png'),
('projects','rls-public-test','[TEST] public',true,'ca3574a5-1789-4012-910c-42f85a513b9b/public-test.png');
insert into storage.objects(bucket_id,name) values
('portfolio','ca3574a5-1789-4012-910c-42f85a513b9b/private-test.png'),
('portfolio','ca3574a5-1789-4012-910c-42f85a513b9b/public-test.png');
do $$begin
 if (select count(*) from public.entries where slug like 'rls-%-test')<>2 then raise exception 'Owner cannot read both rows';end if;
end$$;
select public.order_entries(array(select id from public.entries where slug like 'rls-%-test' order by slug desc),'projects');
do $$begin
 if (select position from public.entries where slug='rls-public-test')<>0 or (select position from public.entries where slug='rls-private-test')<>1 then raise exception 'Manual ordering failed';end if;
end$$;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$begin
 if (select count(*) from public.entries where slug like 'rls-%-test')<>1 then raise exception 'Public read leaked draft';end if;
 if (select count(*) from storage.objects where name like '%-test.png')<>1 then raise exception 'Storage leaked draft';end if;
 begin
  insert into public.entries(kind,slug,title) values('projects','rls-anon-test','[TEST] blocked');
  raise exception 'Anonymous insert allowed';
 exception when insufficient_privilege then null;end;
 begin
  insert into storage.objects(bucket_id,name) values('portfolio','anon-test.png');
  raise exception 'Anonymous upload allowed';
 exception when insufficient_privilege then null;end;
end$$;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$declare affected integer;begin
 if (select count(*) from public.entries where slug like 'rls-%-test')<>1 then raise exception 'Other user read leaked draft';end if;
 begin
  insert into public.entries(kind,slug,title) values('projects','rls-other-test','[TEST] blocked');
  raise exception 'Other user insert allowed';
 exception when insufficient_privilege then null;end;
 update public.entries set title='[TEST] tampered' where slug='rls-public-test';get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Other user update allowed';end if;
 delete from public.entries where slug='rls-public-test';get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Other user delete allowed';end if;
 begin
  insert into storage.objects(bucket_id,name) values('portfolio','ca3574a5-1789-4012-910c-42f85a513b9b/other-test.png');
  raise exception 'Other user upload allowed';
 exception when insufficient_privilege then null;end;
 update storage.objects set metadata='{}'::jsonb where name like '%-test.png';get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Other user file update allowed';end if;
end$$;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"ca3574a5-1789-4012-910c-42f85a513b9b","role":"authenticated"}',true);
update public.entries set title='[TEST] owner update' where slug='rls-private-test';
do $$begin
 if not exists(select 1 from public.entries where slug='rls-private-test' and title='[TEST] owner update') then raise exception 'Owner update failed';end if;
end$$;
delete from public.entries where slug='rls-private-test';
do $$begin
 if exists(select 1 from public.entries where slug='rls-private-test') then raise exception 'Owner delete failed';end if;
end$$;
rollback;
select 'PASS: owner create/read/update/delete; public published-only reads; draft media hidden; anonymous and other-user entry writes/uploads and media updates blocked. Fixtures rolled back.' as result;
