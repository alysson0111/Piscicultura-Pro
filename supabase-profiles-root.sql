create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nome text,
  email text not null,
  tipo_usuario text not null default 'cliente'
    check (tipo_usuario in ('root', 'cliente', 'parceiro')),
  status text not null default 'ativo'
    check (status in ('ativo', 'bloqueado')),
  status_pagamento text not null default 'ativo'
    check (status_pagamento in ('ativo', 'vencido', 'isento')),
  created_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists valor_mensal numeric default 0;

alter table public.profiles
add column if not exists desconto_percentual numeric default 0;

alter table public.profiles
add column if not exists valor_final numeric default 0;

alter table public.profiles
add column if not exists data_vencimento date;

create or replace function public.calcular_valor_final_profile()
returns trigger
language plpgsql
as $$
begin
  new.valor_final :=
    coalesce(new.valor_mensal, 0) -
    (
      coalesce(new.valor_mensal, 0) *
      coalesce(new.desconto_percentual, 0)
    ) / 100;

  return new;
end;
$$;

drop trigger if exists calcular_valor_final_profile_trigger
on public.profiles;

create trigger calcular_valor_final_profile_trigger
before insert or update of valor_mensal, desconto_percentual
on public.profiles
for each row
execute function public.calcular_valor_final_profile();

grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
revoke insert on public.profiles from anon, authenticated;

alter table public.profiles enable row level security;

create or replace function public.is_root()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and tipo_usuario = 'root'
      and status = 'ativo'
  );
$$;

grant execute on function public.is_root() to authenticated;

drop policy if exists "Usuarios podem ver o proprio perfil" on public.profiles;
drop policy if exists "Root pode ver todos os perfis" on public.profiles;
drop policy if exists "Usuarios podem criar o proprio perfil" on public.profiles;
drop policy if exists "Root pode atualizar perfis" on public.profiles;
drop policy if exists "Usuarios podem atualizar o proprio perfil basico" on public.profiles;

create policy "Usuarios podem ver o proprio perfil"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Root pode ver todos os perfis"
on public.profiles
for select
to authenticated
using (public.is_root());

create policy "Root pode atualizar perfis"
on public.profiles
for update
to authenticated
using (public.is_root())
with check (public.is_root());

insert into public.profiles (
  user_id,
  nome,
  email,
  tipo_usuario,
  status,
  status_pagamento
)
select
  id,
  coalesce(raw_user_meta_data->>'name', email),
  email,
  'root',
  'ativo',
  'isento'
from auth.users
where email = 'alysson0111@gmail.com'
on conflict (user_id) do update
set
  tipo_usuario = 'root',
  status = 'ativo',
  status_pagamento = 'isento';
