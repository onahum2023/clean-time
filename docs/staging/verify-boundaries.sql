-- Staging only. Executes real PostgreSQL guards/RLS with synthetic fixtures,
-- rolls back all fixture writes, and does not confirm/create Auth identities.
begin;
do $$
declare
  fixture_id uuid := gen_random_uuid();
  envelope jsonb := '{"v":1,"alg":"A256GCM","iv":"synthetic","ciphertext":"synthetic","wrappedKey":"synthetic","wrapIv":"synthetic","kdf":{"name":"HKDF","hash":"SHA-256","salt":"synthetic","info":"clean-time/v1/recovery-kek/A256GCM"}}';
begin
  insert into public.user_data(user_id,data) values(fixture_id,'{"synthetic":"legacy"}');
  update public.user_data set data='{"synthetic":"legacy-edit"}' where user_id=fixture_id;
  update public.user_data set data=envelope where user_id=fixture_id;
  begin
    update public.user_data set data='{"synthetic":"downgrade"}' where user_id=fixture_id;
    raise exception 'Guard accepted plaintext downgrade';
  exception when check_violation then null; end;
  begin
    update public.user_data set data=envelope||'{"synthetic_plaintext":"forbidden"}' where user_id=fixture_id;
    raise exception 'Guard accepted mixed plaintext';
  exception when check_violation then null; end;
  begin
    update public.user_data set data=jsonb_set(envelope,'{wrappedKey}','"replacement"') where user_id=fixture_id;
    raise exception 'Guard accepted replacement wrapper';
  exception when check_violation then null; end;
  update public.user_data set data=jsonb_set(envelope,'{ciphertext}','"synthetic-next"') where user_id=fixture_id;
end;
$$;
do $$
declare own_id uuid:=gen_random_uuid(); peer_id uuid:=gen_random_uuid(); affected integer;
begin
  insert into public.user_data(user_id,data) values(own_id,'{"synthetic":"own"}'),(peer_id,'{"synthetic":"peer"}');
  perform set_config('request.jwt.claims',json_build_object('sub',own_id::text,'role','authenticated')::text,true);
  execute 'set local role authenticated';
  select count(*) into affected from public.user_data;
  if affected<>1 then raise exception 'RLS exposed another owner'; end if;
  update public.user_data set data='{"synthetic":"forbidden"}' where user_id=peer_id;
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'RLS updated another owner'; end if;
  begin
    insert into public.user_data(user_id,data) values(gen_random_uuid(),'{"synthetic":"forbidden"}');
    raise exception 'RLS accepted cross-owner insert';
  exception when insufficient_privilege then null; end;
  begin
    update public.user_data set user_id=peer_id where user_id=own_id;
    raise exception 'RLS accepted ownership reassignment';
  exception when insufficient_privilege then null; end;
  if has_table_privilege('authenticated','public.user_data','DELETE') then raise exception 'Unexpected physical delete grant'; end if;
end;
$$;
rollback;
