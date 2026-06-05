alter table public.profiles
add column if not exists data_ativacao_pro timestamptz;

alter table public.profiles
add column if not exists data_vencimento date;

update public.profiles
set data_ativacao_pro = coalesce(
  data_ativacao_pro,
  created_at
)
where plano = 'pro';

update public.profiles
set data_vencimento = (
  data_ativacao_pro + interval '1 month'
)::date
where plano = 'pro'
  and data_ativacao_pro is not null
  and data_vencimento is null;

update public.profiles
set
  data_ativacao_pro = null,
  data_vencimento = null
where plano in ('teste', 'isento');
