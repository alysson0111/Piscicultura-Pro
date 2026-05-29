create table if not exists public.manutencao (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo_local text not null default 'tanque',
  tanque text,
  outro_local text,
  local text not null,
  data_manutencao date not null,
  servico_executado text not null,
  created_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.manutencao to authenticated;

alter table public.manutencao enable row level security;

drop policy if exists "Usuarios podem ver suas manutencoes"
on public.manutencao;

drop policy if exists "Usuarios podem criar suas manutencoes"
on public.manutencao;

drop policy if exists "Usuarios podem atualizar suas manutencoes"
on public.manutencao;

drop policy if exists "Usuarios podem excluir suas manutencoes"
on public.manutencao;

create policy "Usuarios podem ver suas manutencoes"
on public.manutencao
for select
to authenticated
using (auth.uid() = user_id);

create policy "Usuarios podem criar suas manutencoes"
on public.manutencao
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Usuarios podem atualizar suas manutencoes"
on public.manutencao
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Usuarios podem excluir suas manutencoes"
on public.manutencao
for delete
to authenticated
using (auth.uid() = user_id);
