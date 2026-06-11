-- Aplica a validade do plano diretamente no banco de dados.
-- A tabela profiles permanece acessivel para informar o motivo do bloqueio.

create or replace function public.usuario_com_acesso_ao_sistema()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.profiles as perfil
    where perfil.user_id = auth.uid()
      and perfil.status = 'ativo'
      and (
        perfil.tipo_usuario in ('root', 'parceiro')
        or perfil.status_pagamento = 'isento'
        or perfil.plano = 'isento'
        or (
          perfil.plano = 'teste'
          and coalesce(
            perfil.teste_termina_em,
            perfil.created_at + interval '30 days'
          ) > now()
        )
        or (
          perfil.plano = 'pro'
          and (
            (
              perfil.data_vencimento is null
              and perfil.status_pagamento <> 'vencido'
            )
            or current_date <=
              perfil.data_vencimento + 5
          )
        )
      )
  );
$$;

revoke all on function public.usuario_com_acesso_ao_sistema()
from public;

grant execute
on function public.usuario_com_acesso_ao_sistema()
to authenticated;

do $$
declare
  tabela text;
  tabelas text[] := array[
    'tanques',
    'lotes',
    'biometria',
    'mortalidade',
    'custos',
    'vendas',
    'estoque',
    'parametros',
    'manutencao'
  ];
begin
  foreach tabela in array tabelas
  loop
    if to_regclass(
      format('public.%I', tabela)
    ) is not null then
      execute format(
        'alter table public.%I enable row level security',
        tabela
      );

      execute format(
        'drop policy if exists %I on public.%I',
        'Plano ativo permite acesso',
        tabela
      );

      execute format(
        'create policy %I on public.%I
         as restrictive
         for all
         to authenticated
         using (public.usuario_com_acesso_ao_sistema())
         with check (public.usuario_com_acesso_ao_sistema())',
        'Plano ativo permite acesso',
        tabela
      );
    end if;
  end loop;
end;
$$;

select
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
  and policyname = 'Plano ativo permite acesso'
order by tablename;
