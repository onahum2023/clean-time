-- REQUIRED before releasing the encrypted client. No row rewrite, auth or RLS change.
-- Legacy clients may still update legacy rows. Once encrypted, prevent downgrade,
-- including an old client's upsert and plaintext deletion tombstone.
-- Exact keys also reject a legacy normalizer retaining ciphertext beside plaintext.
begin;
create or replace function public.guard_user_data_encryption()
returns trigger language plpgsql set search_path = public as $$
begin
  if TG_OP = 'UPDATE' and OLD.data ? 'ciphertext' then
    if (jsonb_typeof(NEW.data) = 'object'
            and NEW.data ?& array['v','alg','iv','ciphertext','wrappedKey','wrapIv','kdf']
            and NEW.data - array['v','alg','iv','ciphertext','wrappedKey','wrapIv','kdf'] = '{}'::jsonb
            and NEW.data ->> 'v' = '1' and NEW.data ->> 'alg' = 'A256GCM') is not true then
      raise exception 'Encrypted backup requires an encrypted client' using errcode = '23514';
    end if;
    -- This release does not support DEK/recovery-key rotation. Prevent stale/new
    -- devices from replacing an established wrapper, even with matching clocks.
    if NEW.data -> 'wrappedKey' is distinct from OLD.data -> 'wrappedKey'
       or NEW.data -> 'wrapIv' is distinct from OLD.data -> 'wrapIv'
       or NEW.data -> 'kdf' is distinct from OLD.data -> 'kdf' then
      raise exception 'Encryption wrapper cannot be replaced' using errcode = '23514';
    end if;
  end if;
  return NEW;
end;
$$;
drop trigger if exists user_data_encryption_guard on public.user_data;
create trigger user_data_encryption_guard before update on public.user_data
for each row execute function public.guard_user_data_encryption();
commit;
