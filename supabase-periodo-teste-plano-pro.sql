alter table public.profiles
add column if not exists plano text;

alter table public.profiles
add column if not exists teste_inicia_em timestamptz default now();

alter table public.profiles
add column if not exists teste_termina_em timestamptz
default (now() + interval '30 days');

alter table public.profiles
alter column teste_inicia_em set default now();

alter table public.profiles
alter column teste_termina_em
set default (now() + interval '30 days');

update public.profiles
set plano = case
  when tipo_usuario in ('root', 'parceiro')
    or status_pagamento = 'isento'
    then 'isento'
  else 'pro'
end
where plano is null;

alter table public.profiles
alter column plano set default 'teste';

alter table public.profiles
alter column plano set not null;

alter table public.profiles
drop constraint if exists profiles_plano_check;

alter table public.profiles
add constraint profiles_plano_check
check (plano in ('teste', 'pro', 'isento'));

update public.profiles
set
  plano = 'isento',
  teste_inicia_em = null,
  teste_termina_em = null
where tipo_usuario in ('root', 'parceiro')
   or status_pagamento = 'isento';
