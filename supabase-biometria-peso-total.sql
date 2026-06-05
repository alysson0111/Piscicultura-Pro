alter table public.biometria
add column if not exists peso_total numeric;

update public.biometria
set peso_total = biomassa * 1000
where peso_total is null
  and biomassa is not null;
