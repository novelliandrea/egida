-- =====================================================================
-- EGIDA - SCHEMA DATABASE INIZIALE PER SUPABASE (PostgreSQL)
-- =====================================================================
-- Include: ENUM, Tabelle, Indici, Row Level Security (RLS),
-- Trigger di creazione automatica profilo utente.
-- Da eseguire nel SQL Editor di Supabase (progetto vuoto o esistente).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. ESTENSIONI NECESSARIE
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- per gen_random_uuid()


-- ---------------------------------------------------------------------
-- 1. TIPI ENUM
-- ---------------------------------------------------------------------

create type stato_approvazione_enum as enum ('pending', 'accepted', 'rejected');

create type mezzo_trasporto_enum as enum ('piedi', 'auto', 'mezzi', 'bici');

create type stato_percorso_enum as enum ('in_corso', 'completato', 'interrotto', 'sos_attivato');

create type tipo_pericolo_enum as enum (
    'zona_buia',
    'aggressione',
    'molestie',
    'strada_degradata',
    'illuminazione_assente',
    'persone_sospette',
    'lavori_in_corso',
    'ostacoli'
);


-- ---------------------------------------------------------------------
-- 2. TABELLA: profiles
-- Collegata 1:1 con auth.users. Contiene i dati pubblici/di gioco.
-- ---------------------------------------------------------------------

create table public.profiles (
    id              uuid primary key references auth.users (id) on delete cascade,
    username        text unique,
    avatar_url      text,
    punti_totali    integer not null default 0,
    livello         integer not null default 1,
    created_at      timestamptz not null default now()
);

comment on table public.profiles is 'Profilo pubblico e dati gamification, 1:1 con auth.users';


-- ---------------------------------------------------------------------
-- 3. TABELLA: contatti_fidati
-- Cerchia di sicurezza. Relazione N:N tra profili.
-- ---------------------------------------------------------------------

create table public.contatti_fidati (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid not null references public.profiles (id) on delete cascade,
    contatto_id         uuid not null references public.profiles (id) on delete cascade,
    stato_approvazione  stato_approvazione_enum not null default 'pending',
    created_at          timestamptz not null default now(),

    constraint chk_contatto_diverso_da_utente check (user_id <> contatto_id),
    constraint uq_coppia_contatto unique (user_id, contatto_id)
);

comment on table public.contatti_fidati is 'Relazioni di fiducia tra utenti (richiesta/accettazione)';


-- ---------------------------------------------------------------------
-- 4. TABELLA: percorsi
-- Tragitti "Torno a casa"
-- ---------------------------------------------------------------------

create table public.percorsi (
    id                          uuid primary key default gen_random_uuid(),
    user_id                     uuid not null references public.profiles (id) on delete cascade,
    destinazione_nome           text,
    destinazione_lat            double precision,
    destinazione_lon            double precision,
    mezzo_trasporto             mezzo_trasporto_enum not null,
    stato                       stato_percorso_enum not null default 'in_corso',
    eta_stimato                 timestamptz,
    created_at                  timestamptz not null default now()
);

comment on table public.percorsi is 'Tragitti monitorati dalla funzione "Torno a casa"';


-- ---------------------------------------------------------------------
-- 5. TABELLA: coordinate_percorso
-- Storico GPS in tempo reale (scritture frequenti)
-- ---------------------------------------------------------------------

create table public.coordinate_percorso (
    id              bigint generated always as identity primary key,
    percorso_id     uuid not null references public.percorsi (id) on delete cascade,
    latitudine      double precision not null,
    longitudine     double precision not null,
    "timestamp"     timestamptz not null default now()
);

comment on table public.coordinate_percorso is 'Punti GPS storici di un percorso, alta frequenza di scrittura';


-- ---------------------------------------------------------------------
-- 6. TABELLA: segnalazioni_community
-- Segnalazioni per la mappa della sicurezza
-- ---------------------------------------------------------------------

create table public.segnalazioni_community (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid references public.profiles (id) on delete set null, -- null = anonima
    tipo_pericolo   tipo_pericolo_enum not null,
    latitudine      double precision not null,
    longitudine     double precision not null,
    voti_conferma   integer not null default 0,
    valido_fino_a   timestamptz not null default (now() + interval '6 hours'),
    created_at      timestamptz not null default now()
);

comment on table public.segnalazioni_community is 'Segnalazioni utenti sulla mappa della sicurezza, con scadenza temporale';


-- ---------------------------------------------------------------------
-- 7. TABELLA: sos_eventi
-- ---------------------------------------------------------------------

create table public.sos_eventi (
    id                  uuid primary key default gen_random_uuid(),
    percorso_id         uuid references public.percorsi (id) on delete set null,
    user_id             uuid not null references public.profiles (id) on delete cascade,
    livello_batteria    smallint check (livello_batteria between 0 and 100),
    audio_cloud_url     text,
    risolto             boolean not null default false,
    created_at          timestamptz not null default now()
);

comment on table public.sos_eventi is 'Eventi generati dal pulsante SOS Intelligente';


-- ---------------------------------------------------------------------
-- 8. TABELLA: serate_inthenight
-- Modulo Nightlife
-- ---------------------------------------------------------------------

create table public.serate_inthenight (
    id                  uuid primary key default gen_random_uuid(),
    nome_locale         text not null,
    evento_nome         text,
    latitudine          double precision not null,
    longitudine         double precision not null,
    prezzo_biglietto    numeric(10,2) default 0,
    data_evento         timestamptz not null
);

comment on table public.serate_inthenight is 'Eventi e locali per il modulo nightlife "inthenight"';


-- ---------------------------------------------------------------------
-- 9. INDICI DI PERFORMANCE
-- ---------------------------------------------------------------------

create index idx_contatti_fidati_user_id       on public.contatti_fidati (user_id);
create index idx_contatti_fidati_contatto_id   on public.contatti_fidati (contatto_id);
create index idx_percorsi_user_id              on public.percorsi (user_id);
create index idx_percorsi_stato                on public.percorsi (stato);
create index idx_coordinate_percorso_id        on public.coordinate_percorso (percorso_id);
create index idx_segnalazioni_scadenza         on public.segnalazioni_community (valido_fino_a);
create index idx_segnalazioni_geoloc           on public.segnalazioni_community (latitudine, longitudine);
create index idx_sos_eventi_user_id            on public.sos_eventi (user_id);
create index idx_serate_data_evento            on public.serate_inthenight (data_evento);


-- =====================================================================
-- 10. FUNZIONE + TRIGGER: creazione automatica profilo utente
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, username, avatar_url)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
        new.raw_user_meta_data ->> 'avatar_url'
    );
    return new;
end;
$$;

-- Il trigger scatta dopo ogni nuova registrazione in auth.users
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();


-- =====================================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Funzione helper: verifica se auth.uid() è un contatto fidato ACCETTATO
-- del proprietario (owner_id) di una riga, in una delle due direzioni.
create or replace function public.is_trusted_contact(owner_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1
        from public.contatti_fidati cf
        where cf.stato_approvazione = 'accepted'
          and (
                (cf.user_id = owner_id and cf.contatto_id = auth.uid())
             or (cf.contatto_id = owner_id and cf.user_id = auth.uid())
          )
    );
$$;


-- ------------------------- profiles -------------------------
alter table public.profiles enable row level security;

-- Ogni utente vede il proprio profilo + i profili dei contatti fidati accettati
create policy "profiles_select_own_or_trusted"
    on public.profiles for select
    using (
        id = auth.uid()
        or public.is_trusted_contact(id)
    );

create policy "profiles_update_own"
    on public.profiles for update
    using (id = auth.uid())
    with check (id = auth.uid());

-- Nessuna policy di insert/delete diretta: la riga viene creata solo dal trigger


-- ------------------------- contatti_fidati -------------------------
alter table public.contatti_fidati enable row level security;

-- Vede le richieste in cui è coinvolto (mittente o destinatario)
create policy "contatti_select_partecipante"
    on public.contatti_fidati for select
    using (user_id = auth.uid() or contatto_id = auth.uid());

-- Può creare una richiesta solo a proprio nome
create policy "contatti_insert_come_richiedente"
    on public.contatti_fidati for insert
    with check (user_id = auth.uid());

-- Solo il destinatario può accettare/rifiutare la richiesta
create policy "contatti_update_come_destinatario"
    on public.contatti_fidati for update
    using (contatto_id = auth.uid())
    with check (contatto_id = auth.uid());

-- Entrambe le parti possono rimuovere la relazione
create policy "contatti_delete_partecipante"
    on public.contatti_fidati for delete
    using (user_id = auth.uid() or contatto_id = auth.uid());


-- ------------------------- percorsi -------------------------
alter table public.percorsi enable row level security;

-- Vede il proprio percorso o quello di un utente che lo ha tra i contatti fidati
create policy "percorsi_select_own_or_trusted"
    on public.percorsi for select
    using (
        user_id = auth.uid()
        or public.is_trusted_contact(user_id)
    );

create policy "percorsi_insert_own"
    on public.percorsi for insert
    with check (user_id = auth.uid());

create policy "percorsi_update_own"
    on public.percorsi for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "percorsi_delete_own"
    on public.percorsi for delete
    using (user_id = auth.uid());


-- ------------------------- coordinate_percorso -------------------------
alter table public.coordinate_percorso enable row level security;

-- Vede le coordinate del proprio percorso o di un percorso condiviso da un
-- utente che lo ha tra i contatti fidati (accompagnamento in tempo reale)
create policy "coordinate_select_own_or_trusted"
    on public.coordinate_percorso for select
    using (
        exists (
            select 1 from public.percorsi p
            where p.id = coordinate_percorso.percorso_id
              and (p.user_id = auth.uid() or public.is_trusted_contact(p.user_id))
        )
    );

-- Solo il proprietario del percorso può inserire nuove coordinate (es. da app client)
create policy "coordinate_insert_own"
    on public.coordinate_percorso for insert
    with check (
        exists (
            select 1 from public.percorsi p
            where p.id = coordinate_percorso.percorso_id
              and p.user_id = auth.uid()
        )
    );


-- ------------------------- segnalazioni_community -------------------------
alter table public.segnalazioni_community enable row level security;

-- Mappa condivisa: tutti gli utenti autenticati possono leggere le segnalazioni attive
create policy "segnalazioni_select_all_authenticated"
    on public.segnalazioni_community for select
    to authenticated
    using (true);

-- Chiunque autenticato può creare una segnalazione (anche anonima, user_id null)
create policy "segnalazioni_insert_authenticated"
    on public.segnalazioni_community for insert
    to authenticated
    with check (user_id = auth.uid() or user_id is null);

-- Solo l'autore (se non anonima) può modificare/eliminare la propria segnalazione
create policy "segnalazioni_update_own"
    on public.segnalazioni_community for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "segnalazioni_delete_own"
    on public.segnalazioni_community for delete
    using (user_id = auth.uid());


-- ------------------------- sos_eventi -------------------------
alter table public.sos_eventi enable row level security;

-- Vede i propri eventi SOS o quelli di un utente che lo ha tra i contatti fidati
create policy "sos_select_own_or_trusted"
    on public.sos_eventi for select
    using (
        user_id = auth.uid()
        or public.is_trusted_contact(user_id)
    );

create policy "sos_insert_own"
    on public.sos_eventi for insert
    with check (user_id = auth.uid());

create policy "sos_update_own"
    on public.sos_eventi for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());


-- ------------------------- serate_inthenight -------------------------
-- Dati pubblici del modulo nightlife: lettura libera per utenti autenticati.
-- La scrittura è riservata al ruolo service_role (gestione lato admin/backoffice),
-- quindi non vengono create policy di insert/update/delete per il ruolo authenticated.
alter table public.serate_inthenight enable row level security;

create policy "serate_select_all_authenticated"
    on public.serate_inthenight for select
    to authenticated
    using (true);


-- =====================================================================
-- FINE SCRIPT
-- =====================================================================
