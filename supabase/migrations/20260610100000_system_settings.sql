create table public.system_settings (
  key text primary key,
  value text,
  is_secret boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Leitura: Superadmins podem ler as configurações (verificando a tabela profiles)
create policy "Admins podem ver todas as definições do sistema"
on public.system_settings
for select
using (
  exists (
    select 1 from public.profiles 
    where user_id = auth.uid() and is_admin = true
  )
);

-- Inserção: Superadmins podem inserir definições do sistema
create policy "Admins podem inserir definições do sistema"
on public.system_settings
for insert
with check (
  exists (
    select 1 from public.profiles 
    where user_id = auth.uid() and is_admin = true
  )
);

-- Atualização: Superadmins podem atualizar definições do sistema
create policy "Admins podem atualizar definições do sistema"
on public.system_settings
for update
using (
  exists (
    select 1 from public.profiles 
    where user_id = auth.uid() and is_admin = true
  )
);

-- Eliminação: Superadmins podem apagar definições do sistema
create policy "Admins podem apagar definições do sistema"
on public.system_settings
for delete
using (
  exists (
    select 1 from public.profiles 
    where user_id = auth.uid() and is_admin = true
  )
);

-- Inserir chaves globais por defeito
insert into public.system_settings (key, value, is_secret) values
('evolution_api_url', 'https://evo.kinjani.ai', false),
('evolution_api_key', '', true),
('openai_api_key', '', true),
('gemini_api_key', '', true)
on conflict do nothing;
