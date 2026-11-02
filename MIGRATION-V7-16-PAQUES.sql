-- NOVELYA V7-16 — édition « Pâques »
-- À exécuter UNE fois dans Supabase > SQL Editor (après MIGRATION-V7-15-NOUVEL-AN-ANNIVERSAIRE.sql).

alter table public.site_settings drop constraint if exists site_settings_site_theme_check;
alter table public.site_settings add constraint site_settings_site_theme_check
  check (site_theme in ('normal','halloween','christmas','newyear','birthday','easter'));

create or replace function public.set_site_theme(new_theme text, bday_name text default null, bday_message text default null)
returns void language plpgsql security definer set search_path='' as $$
begin
 if (select auth.uid()) is null or not public.is_encria_admin() then raise exception 'Accès réservé aux administrateurs'; end if;
 if new_theme is null or new_theme not in ('normal','halloween','christmas','newyear','birthday','easter') then raise exception 'Thème invalide'; end if;
 if new_theme = 'birthday' then
  update public.site_settings
     set site_theme = new_theme,
         halloween_enabled = false,
         birthday_name = nullif(left(btrim(coalesce(bday_name,'')),40),''),
         birthday_message = nullif(left(btrim(coalesce(bday_message,'')),140),''),
         updated_at = now()
   where id = 1;
 else
  update public.site_settings set site_theme = new_theme, halloween_enabled = (new_theme = 'halloween'), updated_at = now() where id = 1;
 end if;
 if not found then raise exception 'Configuration du site introuvable'; end if;
end;$$;
revoke all on function public.set_site_theme(text,text,text) from public, anon;
grant execute on function public.set_site_theme(text,text,text) to authenticated;
