-- Schema iniziale per Egida.
-- Come usarlo: apri il tuo progetto su supabase.com → SQL Editor → New query,
-- incolla tutto questo file, premi "Run". Crea le tabelle e le regole di
-- accesso di cui l'app ha bisogno per partire.
--
-- Nota importante: per ora NON c'è ancora il login (vedi README.md, è il
-- prossimo passo). Per questo le regole di sicurezza qui sotto sono
-- volutamente permissive (chiunque usi la app può leggere/scrivere) — vanno
-- strette non appena aggiungiamo l'autenticazione, altrimenti chiunque
-- potrebbe leggere i contatti fidati di chiunque altro.

-- ==========================================================
-- SEGNALAZIONI DELLA COMMUNITY
-- ==========================================================
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null,
  risk_level text not null check (risk_level in ('bassa', 'media', 'alta')),
  note text,
  latitude double precision not null,
  longitude double precision not null,
  is_anonymous boolean not null default true,
  confirm_count integer not null default 0
);

alter table reports enable row level security;

create policy "chiunque può leggere le segnalazioni"
  on reports for select
  using (true);

create policy "chiunque può creare una segnalazione"
  on reports for insert
  with check (true);

-- ==========================================================
-- CONTATTI FIDATI
-- ==========================================================
create table if not exists trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  role text,
  phone text
);

alter table trusted_contacts enable row level security;

create policy "chiunque può leggere i contatti fidati (temporaneo, senza login)"
  on trusted_contacts for select
  using (true);

create policy "chiunque può aggiungere un contatto fidato (temporaneo, senza login)"
  on trusted_contacts for insert
  with check (true);

-- ==========================================================
-- EVENTI SOS (storico di quando è stato premuto il pulsante SOS)
-- ==========================================================
create table if not exists sos_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  latitude double precision,
  longitude double precision,
  was_cancelled boolean not null default false
);

alter table sos_events enable row level security;

create policy "chiunque può creare un evento SOS"
  on sos_events for insert
  with check (true);

create policy "chiunque può leggere gli eventi SOS (temporaneo, senza login)"
  on sos_events for select
  using (true);
