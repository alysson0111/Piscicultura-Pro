-- Impede que usuarios comuns criem perfis com privilegios elevados.
-- Novos perfis continuam sendo criados pelo gatilho em auth.users.

revoke insert on table public.profiles from anon, authenticated;

drop policy if exists "Usuarios podem criar o proprio perfil"
on public.profiles;

select
  has_table_privilege(
    'authenticated',
    'public.profiles',
    'insert'
  ) as authenticated_pode_inserir_profile,
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Usuarios podem criar o proprio perfil'
  ) as politica_insegura_existe;
