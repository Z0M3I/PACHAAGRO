-- ============================================================
-- PACHAAGRO · Row Level Security y Storage
-- ============================================================

alter table public.departments enable row level security;
alter table public.municipalities enable row level security;
alter table public.communities enable row level security;
alter table public.crops enable row level security;
alter table public.content_categories enable row level security;
alter table public.profiles enable row level security;
alter table public.user_crops enable row level security;
alter table public.announcements enable row level security;
alter table public.meetings enable row level security;
alter table public.weather_alerts enable row level security;
alter table public.educational_contents enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.notification_logs enable row level security;

-- ---------- Catálogos públicos ----------
create policy "departments_public_read"
  on public.departments for select
  to anon, authenticated
  using (true);

create policy "departments_admin_write"
  on public.departments for insert
  to authenticated
  with check (public.is_admin());

create policy "departments_admin_update"
  on public.departments for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "departments_admin_delete"
  on public.departments for delete
  to authenticated
  using (public.is_admin());

create policy "municipalities_public_read"
  on public.municipalities for select
  to anon, authenticated
  using (true);

create policy "municipalities_admin_write"
  on public.municipalities for insert
  to authenticated
  with check (public.is_admin());

create policy "municipalities_admin_update"
  on public.municipalities for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "municipalities_admin_delete"
  on public.municipalities for delete
  to authenticated
  using (public.is_admin());

create policy "communities_public_read"
  on public.communities for select
  to anon, authenticated
  using (true);

create policy "communities_admin_write"
  on public.communities for insert
  to authenticated
  with check (public.is_admin());

create policy "communities_admin_update"
  on public.communities for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "communities_admin_delete"
  on public.communities for delete
  to authenticated
  using (public.is_admin());

create policy "crops_public_read"
  on public.crops for select
  to anon, authenticated
  using (true);

create policy "crops_admin_write"
  on public.crops for insert
  to authenticated
  with check (public.is_admin());

create policy "crops_admin_update"
  on public.crops for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "crops_admin_delete"
  on public.crops for delete
  to authenticated
  using (public.is_admin());

create policy "categories_public_read"
  on public.content_categories for select
  to anon, authenticated
  using (true);

create policy "categories_editor_write"
  on public.content_categories for insert
  to authenticated
  with check (public.can_manage_content());

create policy "categories_editor_update"
  on public.content_categories for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

create policy "categories_admin_delete"
  on public.content_categories for delete
  to authenticated
  using (public.is_admin());

-- ---------- Perfiles ----------
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "profiles_insert_admin"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create policy "profiles_delete_admin"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- ---------- Cultivos del usuario ----------
create policy "user_crops_select_own_or_admin"
  on public.user_crops for select
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy "user_crops_insert_own_or_admin"
  on public.user_crops for insert
  to authenticated
  with check (profile_id = auth.uid() or public.is_admin());

create policy "user_crops_update_own_or_admin"
  on public.user_crops for update
  to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

create policy "user_crops_delete_own_or_admin"
  on public.user_crops for delete
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

-- ---------- Comunicados ----------
create policy "announcements_public_read_published"
  on public.announcements for select
  to anon, authenticated
  using (
    (is_published and (expires_at is null or expires_at > now()))
    or public.can_manage_content()
    or public.is_admin()
  );

create policy "announcements_editor_insert"
  on public.announcements for insert
  to authenticated
  with check (public.can_manage_content());

create policy "announcements_editor_update"
  on public.announcements for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

create policy "announcements_editor_delete"
  on public.announcements for delete
  to authenticated
  using (public.can_manage_content());

-- ---------- Reuniones ----------
create policy "meetings_public_read"
  on public.meetings for select
  to anon, authenticated
  using (true);

create policy "meetings_staff_insert"
  on public.meetings for insert
  to authenticated
  with check (public.can_manage_meetings());

create policy "meetings_staff_update"
  on public.meetings for update
  to authenticated
  using (
    public.is_admin()
    or (public.can_manage_meetings() and author_id = auth.uid())
  )
  with check (
    public.is_admin()
    or (public.can_manage_meetings() and author_id = auth.uid())
  );

create policy "meetings_staff_delete"
  on public.meetings for delete
  to authenticated
  using (
    public.is_admin()
    or (public.can_manage_meetings() and author_id = auth.uid())
  );

-- ---------- Alertas meteorológicas ----------
create policy "weather_alerts_public_read_active"
  on public.weather_alerts for select
  to anon, authenticated
  using (
    public.is_admin()
    or (
      is_active
      and (ends_at is null or ends_at > now())
      and starts_at <= now() + interval '7 days'
    )
  );

create policy "weather_alerts_admin_insert"
  on public.weather_alerts for insert
  to authenticated
  with check (public.is_admin());

create policy "weather_alerts_admin_update"
  on public.weather_alerts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "weather_alerts_admin_delete"
  on public.weather_alerts for delete
  to authenticated
  using (public.is_admin());

-- ---------- Biblioteca educativa ----------
create policy "contents_public_read_published"
  on public.educational_contents for select
  to anon, authenticated
  using (is_published or public.can_manage_content() or public.is_admin());

create policy "contents_editor_insert"
  on public.educational_contents for insert
  to authenticated
  with check (public.can_manage_content());

create policy "contents_editor_update"
  on public.educational_contents for update
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

create policy "contents_editor_delete"
  on public.educational_contents for delete
  to authenticated
  using (public.can_manage_content());

-- ---------- Preferencias ----------
create policy "preferences_select_own_or_admin"
  on public.notification_preferences for select
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy "preferences_insert_own_or_admin"
  on public.notification_preferences for insert
  to authenticated
  with check (profile_id = auth.uid() or public.is_admin());

create policy "preferences_update_own_or_admin"
  on public.notification_preferences for update
  to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- ---------- Mensajes y registros ----------
create policy "whatsapp_messages_admin_read"
  on public.whatsapp_messages for select
  to authenticated
  using (public.is_admin());

create policy "notification_logs_own_or_admin_read"
  on public.notification_logs for select
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

-- La escritura en whatsapp_messages y notification_logs se realiza
-- exclusivamente con service_role desde el servidor.

-- ---------- Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('educational-assets', 'educational-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "avatars_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "educational_assets_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'educational-assets');

create policy "educational_assets_editor_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'educational-assets' and public.can_manage_content()
  );

create policy "educational_assets_editor_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'educational-assets' and public.can_manage_content()
  );

-- ---------- Permisos de tabla ----------
grant usage on schema public to anon, authenticated, service_role;

grant select on
  public.departments,
  public.municipalities,
  public.communities,
  public.crops,
  public.content_categories,
  public.announcements,
  public.meetings,
  public.weather_alerts,
  public.educational_contents
to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
