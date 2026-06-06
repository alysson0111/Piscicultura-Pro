alter table public.profiles
add column if not exists plano text default 'teste';

alter table public.profiles
add column if not exists teste_inicia_em timestamptz;

alter table public.profiles
add column if not exists teste_termina_em timestamptz;

alter table public.profiles
add column if not exists data_ativacao_pro timestamptz;

alter table public.profiles
add column if not exists data_vencimento date;

create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plano_inicial text;
  inicio_teste timestamptz;
begin
  plano_inicial := coalesce(
    new.raw_user_meta_data->>'plano',
    'teste'
  );

  inicio_teste := coalesce(
    (new.raw_user_meta_data->>'teste_inicia_em')::timestamptz,
    new.created_at,
    now()
  );

  insert into public.profiles (
    user_id,
    nome,
    email,
    tipo_usuario,
    status,
    status_pagamento,
    plano,
    teste_inicia_em,
    teste_termina_em,
    data_ativacao_pro,
    data_vencimento
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email,
    'cliente',
    'ativo',
    'ativo',
    plano_inicial,
    case
      when plano_inicial = 'teste'
        then inicio_teste
      else null
    end,
    case
      when plano_inicial = 'teste'
        then inicio_teste + interval '30 days'
      else null
    end,
    case
      when plano_inicial = 'pro'
        then coalesce(new.created_at, now())
      else null
    end,
    case
      when plano_inicial = 'pro'
        then (
          coalesce(new.created_at, now()) + interval '1 month'
        )::date
      else null
    end
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists criar_perfil_apos_cadastro
on auth.users;

create trigger criar_perfil_apos_cadastro
after insert on auth.users
for each row
execute function public.criar_perfil_novo_usuario();

insert into public.profiles (
  user_id,
  nome,
  email,
  tipo_usuario,
  status,
  status_pagamento,
  plano,
  teste_inicia_em,
  teste_termina_em,
  data_ativacao_pro,
  data_vencimento
)
select
  usuario.id,
  coalesce(
    usuario.raw_user_meta_data->>'name',
    split_part(usuario.email, '@', 1)
  ),
  usuario.email,
  'cliente',
  'ativo',
  'ativo',
  coalesce(
    usuario.raw_user_meta_data->>'plano',
    'teste'
  ),
  case
    when coalesce(
      usuario.raw_user_meta_data->>'plano',
      'teste'
    ) = 'teste'
      then coalesce(
        (usuario.raw_user_meta_data->>'teste_inicia_em')::timestamptz,
        usuario.created_at
      )
    else null
  end,
  case
    when coalesce(
      usuario.raw_user_meta_data->>'plano',
      'teste'
    ) = 'teste'
      then coalesce(
        (usuario.raw_user_meta_data->>'teste_inicia_em')::timestamptz,
        usuario.created_at
      ) + interval '30 days'
    else null
  end,
  case
    when usuario.raw_user_meta_data->>'plano' = 'pro'
      then usuario.created_at
    else null
  end,
  case
    when usuario.raw_user_meta_data->>'plano' = 'pro'
      then (usuario.created_at + interval '1 month')::date
    else null
  end
from auth.users as usuario
where not exists (
  select 1
  from public.profiles as perfil
  where perfil.user_id = usuario.id
);
