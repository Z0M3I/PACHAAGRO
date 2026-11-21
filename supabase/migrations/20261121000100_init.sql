-- ============================================================
-- PACHAAGRO · Esquema inicial
-- PostgreSQL / Supabase
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Tipos ----------
create type public.user_role as enum (
  'admin',
  'producer',
  'association_manager',
  'content_editor'
);

create type public.announcement_type as enum (
  'announcement',
  'communique',
  'weather',
  'meeting',
  'event'
);

create type public.audience_scope as enum (
  'national',
  'department',
  'municipality',
  'community',
  'crop'
);

create type public.educational_content_type as enum (
  'guide',
  'crop_info',
  'care',
  'calendar',
  'pest',
  'disease',
  'good_practice',
  'soil'
);

create type public.alert_severity as enum (
  'info',
  'moderate',
  'severe',
  'extreme'
);

create type public.notification_channel as enum ('whatsapp', 'in_app');

create type public.notification_kind as enum (
  'weather_alert',
  'meeting',
  'announcement',
  'educational',
  'system'
);

create type public.notification_status as enum (
  'queued',
  'sent',
  'delivered',
  'read',
  'failed',
  'simulated'
);

create type public.message_direction as enum ('inbound', 'outbound');

-- ---------- Referencia geográfica ----------
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) between 2 and 80),
  code text not null unique check (length(code) = 2),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  created_at timestamptz not null default now()
);

create table public.municipalities (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete restrict,
  name text not null check (length(trim(name)) between 2 and 120),
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  created_at timestamptz not null default now(),
  unique (department_id, name),
  unique (department_id, slug),
  unique (id, department_id)
);

create index municipalities_department_idx
  on public.municipalities (department_id);

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 120),
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  created_at timestamptz not null default now(),
  unique (municipality_id, name),
  unique (municipality_id, slug),
  unique (id, municipality_id)
);

create index communities_municipality_idx
  on public.communities (municipality_id);

create table public.crops (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  scientific_name text,
  description text,
  created_at timestamptz not null default now()
);

create table public.content_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description text,
  created_at timestamptz not null default now()
);

-- ---------- Perfiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null check (length(trim(full_name)) between 2 and 120),
  phone text check (phone is null or phone ~ '^[1-9][0-9]{6,14}$'),
  role public.user_role not null default 'producer',
  department_id uuid references public.departments(id) on delete set null,
  municipality_id uuid,
  community_id uuid,
  avatar_url text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_municipality_department_fk
    foreign key (municipality_id, department_id)
    references public.municipalities (id, department_id)
    on delete set null,
  constraint profiles_community_municipality_fk
    foreign key (community_id, municipality_id)
    references public.communities (id, municipality_id)
    on delete set null,
  constraint profiles_hierarchy_check check (
    (municipality_id is null or department_id is not null)
    and (community_id is null or municipality_id is not null)
  )
);

create unique index profiles_phone_unique
  on public.profiles (phone)
  where phone is not null;

create index profiles_department_idx on public.profiles (department_id);
create index profiles_municipality_idx on public.profiles (municipality_id);
create index profiles_role_idx on public.profiles (role);

create table public.user_crops (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  crop_id uuid not null references public.crops(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, crop_id)
);

create index user_crops_crop_idx on public.user_crops (crop_id);

-- ---------- Comunicación ----------
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null check (length(trim(title)) between 4 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  summary text not null check (length(trim(summary)) between 10 and 400),
  body text not null check (length(trim(body)) >= 20),
  type public.announcement_type not null default 'announcement',
  audience_scope public.audience_scope not null default 'national',
  department_id uuid references public.departments(id) on delete set null,
  municipality_id uuid,
  community_id uuid,
  crop_id uuid references public.crops(id) on delete set null,
  is_demo boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_municipality_department_fk
    foreign key (municipality_id, department_id)
    references public.municipalities (id, department_id)
    on delete set null,
  constraint announcements_community_municipality_fk
    foreign key (community_id, municipality_id)
    references public.communities (id, municipality_id)
    on delete set null,
  constraint announcements_scope_check check (
    (audience_scope <> 'department' or department_id is not null)
    and (audience_scope <> 'municipality'
      or (department_id is not null and municipality_id is not null))
    and (audience_scope <> 'community'
      or (department_id is not null and municipality_id is not null and community_id is not null))
    and (audience_scope <> 'crop' or crop_id is not null)
  ),
  constraint announcements_publish_check check (
    not is_published or published_at is not null
  ),
  constraint announcements_dates_check check (
    expires_at is null
    or published_at is null
    or expires_at > published_at
  )
);

create index announcements_published_idx
  on public.announcements (is_published, published_at desc);
create index announcements_department_idx
  on public.announcements (department_id);
create index announcements_municipality_idx
  on public.announcements (municipality_id);
create index announcements_crop_idx on public.announcements (crop_id);
create index announcements_type_idx on public.announcements (type);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null check (length(trim(title)) between 4 and 200),
  description text not null check (length(trim(description)) >= 10),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text not null check (length(trim(location)) between 2 and 240),
  is_virtual boolean not null default false,
  virtual_url text,
  department_id uuid references public.departments(id) on delete set null,
  municipality_id uuid,
  community_id uuid,
  crop_id uuid references public.crops(id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meetings_municipality_department_fk
    foreign key (municipality_id, department_id)
    references public.municipalities (id, department_id)
    on delete set null,
  constraint meetings_community_municipality_fk
    foreign key (community_id, municipality_id)
    references public.communities (id, municipality_id)
    on delete set null,
  constraint meetings_dates_check check (ends_at is null or ends_at > starts_at),
  constraint meetings_virtual_check check (
    not is_virtual or virtual_url is not null
  ),
  constraint meetings_hierarchy_check check (
    (municipality_id is null or department_id is not null)
    and (community_id is null or municipality_id is not null)
  )
);

create index meetings_starts_idx on public.meetings (starts_at);
create index meetings_department_idx on public.meetings (department_id);

create table public.weather_alerts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null check (length(trim(title)) between 4 and 200),
  description text not null check (length(trim(description)) >= 10),
  severity public.alert_severity not null default 'info',
  source text not null check (length(trim(source)) >= 2),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  department_id uuid references public.departments(id) on delete set null,
  municipality_id uuid,
  community_id uuid,
  is_demo boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weather_alerts_municipality_department_fk
    foreign key (municipality_id, department_id)
    references public.municipalities (id, department_id)
    on delete set null,
  constraint weather_alerts_community_municipality_fk
    foreign key (community_id, municipality_id)
    references public.communities (id, municipality_id)
    on delete set null,
  constraint weather_alerts_dates_check check (ends_at is null or ends_at > starts_at),
  constraint weather_alerts_hierarchy_check check (
    (municipality_id is null or department_id is not null)
    and (community_id is null or municipality_id is not null)
  )
);

create index weather_alerts_active_idx
  on public.weather_alerts (is_active, starts_at, ends_at);
create index weather_alerts_department_idx
  on public.weather_alerts (department_id);

-- ---------- Educación ----------
create table public.educational_contents (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null check (length(trim(title)) between 4 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  summary text not null check (length(trim(summary)) between 10 and 400),
  body text not null check (length(trim(body)) >= 20),
  category_id uuid not null references public.content_categories(id) on delete restrict,
  crop_id uuid references public.crops(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  content_type public.educational_content_type not null default 'guide',
  reading_minutes integer not null default 5 check (reading_minutes between 1 and 60),
  cover_image_url text,
  source_notes text,
  is_demo boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index educational_contents_published_idx
  on public.educational_contents (is_published, updated_at desc);
create index educational_contents_category_idx
  on public.educational_contents (category_id);
create index educational_contents_crop_idx
  on public.educational_contents (crop_id);

-- ---------- Notificaciones ----------
create table public.notification_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  whatsapp_opt_in boolean not null default false,
  weather_alerts boolean not null default true,
  meeting_notices boolean not null default true,
  announcements boolean not null default true,
  educational_content boolean not null default false,
  consent_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint notification_preferences_consent_check check (
    not whatsapp_opt_in or consent_at is not null
  )
);

create table public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  wa_message_id text unique,
  direction public.message_direction not null,
  phone text not null check (phone ~ '^[0-9]{7,15}$'),
  message_type text not null default 'text',
  body text not null,
  template_name text,
  status public.notification_status not null default 'queued',
  error_message text,
  is_simulated boolean not null default false,
  created_at timestamptz not null default now()
);

create index whatsapp_messages_phone_idx on public.whatsapp_messages (phone);
create index whatsapp_messages_created_idx
  on public.whatsapp_messages (created_at desc);
create index whatsapp_messages_profile_idx
  on public.whatsapp_messages (profile_id);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  channel public.notification_channel not null default 'whatsapp',
  notification_type public.notification_kind not null,
  reference_id uuid,
  recipient_phone text not null,
  status public.notification_status not null default 'queued',
  provider_message_id text,
  error_message text,
  is_simulated boolean not null default false,
  created_at timestamptz not null default now()
);

create index notification_logs_created_idx
  on public.notification_logs (created_at desc);
create index notification_logs_profile_idx
  on public.notification_logs (profile_id);
create index notification_logs_reference_idx
  on public.notification_logs (reference_id);

-- ---------- Funciones auxiliares ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

create trigger meetings_set_updated_at
  before update on public.meetings
  for each row execute function public.set_updated_at();

create trigger weather_alerts_set_updated_at
  before update on public.weather_alerts
  for each row execute function public.set_updated_at();

create trigger educational_contents_set_updated_at
  before update on public.educational_contents
  for each row execute function public.set_updated_at();

create trigger notification_preferences_set_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

-- ---------- Rol efectivo (evita recursión en RLS) ----------
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() = 'admin', false);
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_role() in ('admin', 'association_manager', 'content_editor'),
    false
  );
$$;

create or replace function public.can_manage_content()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() in ('admin', 'content_editor'), false);
$$;

create or replace function public.can_manage_meetings()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_role() in ('admin', 'association_manager'),
    false
  );
$$;

grant execute on function public.current_role() to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_staff() to anon, authenticated, service_role;
grant execute on function public.can_manage_content() to anon, authenticated, service_role;
grant execute on function public.can_manage_meetings() to anon, authenticated, service_role;

-- ---------- Alta automática de perfil ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_phone text;
  v_department uuid;
  v_municipality uuid;
  v_community uuid;
  v_consent boolean := false;
  v_crops jsonb;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    split_part(coalesce(new.email, 'productor'), '@', 1)
  );

  v_phone := nullif(
    regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '[^0-9]', '', 'g'),
    ''
  );
  if v_phone is null or length(v_phone) < 7 or length(v_phone) > 15 then
    v_phone := null;
  end if;

  begin
    v_department := nullif(new.raw_user_meta_data ->> 'department_id', '')::uuid;
  exception when others then
    v_department := null;
  end;

  begin
    v_municipality := nullif(new.raw_user_meta_data ->> 'municipality_id', '')::uuid;
  exception when others then
    v_municipality := null;
  end;

  begin
    v_community := nullif(new.raw_user_meta_data ->> 'community_id', '')::uuid;
  exception when others then
    v_community := null;
  end;

  v_consent := false;
  begin
    v_consent := coalesce(
      (new.raw_user_meta_data ->> 'whatsapp_consent')::boolean,
      false
    );
  exception when others then
    v_consent := false;
  end;

  if v_department is not null and not exists (
    select 1 from public.departments where id = v_department
  ) then
    v_department := null;
  end if;

  if v_municipality is not null and not exists (
    select 1 from public.municipalities
    where id = v_municipality and department_id = v_department
  ) then
    v_municipality := null;
    v_community := null;
  end if;

  if v_community is not null and not exists (
    select 1 from public.communities
    where id = v_community and municipality_id = v_municipality
  ) then
    v_community := null;
  end if;

  insert into public.profiles (
    id, email, full_name, phone, role,
    department_id, municipality_id, community_id
  ) values (
    new.id, new.email, v_name, v_phone, 'producer',
    v_department, v_municipality, v_community
  );

  insert into public.notification_preferences (
    profile_id, whatsapp_opt_in, consent_at
  ) values (
    new.id, v_consent, case when v_consent then now() else null end
  );

  v_crops := new.raw_user_meta_data -> 'crop_ids';
  if v_crops is not null and jsonb_typeof(v_crops) = 'array' then
    insert into public.user_crops (profile_id, crop_id)
    select new.id, c.id
    from jsonb_array_elements_text(v_crops) as t(crop_value)
    join public.crops c on c.id::text = t.crop_value
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Protección contra escalada de privilegios ----------
create or replace function public.prevent_profile_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'No autorizado para cambiar el rol del perfil';
    end if;
    if new.is_demo is distinct from old.is_demo then
      raise exception 'No autorizado para cambiar el origen del perfil';
    end if;
    if new.email is distinct from old.email then
      raise exception 'No autorizado para cambiar el correo del perfil';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_escalation();
