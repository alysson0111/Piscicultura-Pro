create table if not exists public.parametros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tanque text not null,
  data_medicao date not null,
  amonia numeric default 0,
  nitrito numeric default 0,
  nitrato numeric default 0,
  dureza numeric default 0,
  ph numeric default 0,
  temperatura numeric default 0,
  oxigenio_dissolvido numeric default 0,
  outros text,
  created_at timestamptz not null default now()
);

alter table public.parametros
add column if not exists temperatura numeric default 0;

alter table public.parametros
add column if not exists oxigenio_dissolvido numeric default 0;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.parametros to authenticated;

alter table public.parametros enable row level security;

drop policy if exists "Usuarios podem ver seus parametros"
on public.parametros;

drop policy if exists "Usuarios podem criar seus parametros"
on public.parametros;

drop policy if exists "Usuarios podem atualizar seus parametros"
on public.parametros;

drop policy if exists "Usuarios podem excluir seus parametros"
on public.parametros;

create policy "Usuarios podem ver seus parametros"
on public.parametros
for select
to authenticated
using (auth.uid() = user_id);

create policy "Usuarios podem criar seus parametros"
on public.parametros
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Usuarios podem atualizar seus parametros"
on public.parametros
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Usuarios podem excluir seus parametros"
on public.parametros
for delete
to authenticated
using (auth.uid() = user_id);
