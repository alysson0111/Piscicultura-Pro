alter table public.parametros
add column if not exists temperatura numeric default 0;

alter table public.parametros
add column if not exists oxigenio_dissolvido numeric default 0;
