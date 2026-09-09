-- Migration: 20260909_ficha_access_logs.sql
-- Descripción: Registro y auditoría de accesos al portal personal del instrumentador (/resumen/:token)

create table if not exists public.ficha_access_logs (
    id uuid primary key default gen_random_uuid(),
    token text not null,
    dni text not null,
    accessed_at timestamptz not null default now(),
    user_agent text
);

-- Índice para consultas rápidas por DNI, Token y fecha
create index if not exists idx_ficha_access_logs_dni_date 
on public.ficha_access_logs (dni, token, accessed_at desc);

-- Habilitar Row Level Security (RLS)
alter table public.ficha_access_logs enable row level security;

-- Política de inserción pública desde el portal del instrumentador
create policy "Permitir insercion publica de accesos" 
on public.ficha_access_logs 
for insert 
with check (true);

-- Política de lectura pública/autenticada de accesos
create policy "Permitir lectura publica de accesos por token" 
on public.ficha_access_logs 
for select 
using (true);
