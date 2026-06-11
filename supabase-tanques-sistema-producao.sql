alter table public.tanques
add column if not exists sistema_producao text;

update public.tanques
set sistema_producao = 'RAS'
where sistema_producao is null
   or trim(sistema_producao) = '';

alter table public.tanques
alter column sistema_producao set default 'RAS';

alter table public.tanques
alter column sistema_producao set not null;

alter table public.tanques
drop constraint if exists tanques_sistema_producao_check;

alter table public.tanques
add constraint tanques_sistema_producao_check
check (
  sistema_producao in (
    'RAS',
    'Tanque-rede',
    'Tanque escavado'
  )
);
