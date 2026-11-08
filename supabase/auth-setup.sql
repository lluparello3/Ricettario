-- =====================================================================
-- Ricettario di Famiglia: accesso solo per le persone in allowed_emails
-- Da eseguire una volta in Supabase > SQL Editor > New query > Run.
-- Si può rieseguire senza problemi.
-- =====================================================================

-- 1) Elenco delle email ammesse (non leggibile dall'app)
create table if not exists public.allowed_emails (
  email text primary key
);
alter table public.allowed_emails enable row level security;

insert into public.allowed_emails (email) values
  ('lluparello3@gmail.com'),
  ('alampresemaya.98@gmail.com')
on conflict do nothing;

-- 2) Funzione: l'utente collegato è nell'elenco?
create or replace function public.is_family_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.allowed_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 3) Attiva la protezione sulle tabelle e toglie le vecchie regole "aperte a tutti"
alter table public.recipes enable row level security;
alter table public.shopping_list enable row level security;

do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('recipes', 'shopping_list')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- 4) Solo i membri della famiglia leggono e scrivono
create policy "solo famiglia" on public.recipes
  for all to authenticated
  using (public.is_family_member())
  with check (public.is_family_member());

create policy "solo famiglia" on public.shopping_list
  for all to authenticated
  using (public.is_family_member())
  with check (public.is_family_member());

-- 5) Blocca la creazione di account per email non in elenco
create or replace function public.block_unknown_signups()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.allowed_emails where lower(email) = lower(new.email)
  ) then
    raise exception 'Email non abilitata al ricettario';
  end if;
  return new;
end;
$$;

drop trigger if exists block_unknown_signups on auth.users;
create trigger block_unknown_signups
  before insert on auth.users
  for each row execute function public.block_unknown_signups();
