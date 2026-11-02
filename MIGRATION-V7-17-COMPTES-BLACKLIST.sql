-- NOVELYA V7.17 — à exécuter après les migrations V7.16.
-- Sauvegarder la base avant exécution. Exécuter avec le rôle postgres dans SQL Editor.

-- IMPORTANT : anciennes policies permissives de la première installation, si encore présentes.
drop policy if exists "Public read stories" on public.stories;
drop policy if exists "Public read scheduled chapters" on public.chapters;
-- Garantir que les histoires en attente et leurs chapitres ne sont pas lisibles publiquement.
drop policy if exists "Public read visible stories" on public.stories;
create policy "Public read visible stories" on public.stories for select to anon,authenticated
 using (public.is_encria_admin() or owner_id=auth.uid() or visibility='published' or (visibility='scheduled' and release_at<=now()));
drop policy if exists "Public read visible chapters" on public.chapters;
create policy "Public read visible chapters" on public.chapters for select to anon,authenticated
 using (public.is_encria_admin() or exists(select 1 from public.stories s where s.id=story_id and s.owner_id=auth.uid())
 or (publish_at<=now() and exists(select 1 from public.stories s where s.id=story_id and (s.visibility='published' or (s.visibility='scheduled' and s.release_at<=now())))));

create table if not exists public.novelya_blacklist(
 id bigint generated always as identity primary key,
 term text not null unique check(length(trim(term)) between 2 and 100),
 created_at timestamptz not null default now()
);
alter table public.novelya_blacklist enable row level security;
drop policy if exists "Blacklist admin select" on public.novelya_blacklist;
create policy "Blacklist admin select" on public.novelya_blacklist for select to authenticated using(public.is_encria_admin());
drop policy if exists "Blacklist admin insert" on public.novelya_blacklist;
create policy "Blacklist admin insert" on public.novelya_blacklist for insert to authenticated with check(public.is_encria_admin());
drop policy if exists "Blacklist admin delete" on public.novelya_blacklist;
create policy "Blacklist admin delete" on public.novelya_blacklist for delete to authenticated using(public.is_encria_admin());

-- Expressions de haine, menaces et insultes ciblées. Pas de « putain », « merde », « connard », « con ».
insert into public.novelya_blacklist(term) values
 ('sale arabe'),('sale noir'),('sale juif'),('sale musulman'),('sale asiatique'),('sale blanc'),
 ('sale immigré'),('sale immigrée'),('sale étranger'),('sale étrangère'),('sale handicapé'),
 ('sale handicapée'),('sale homo'),('sale lesbienne'),('sale trans'),('sale femme'),
 ('bougnoule'),('bougnoules'),('bicot'),('bicots'),('bikots'),('négro'),('négros'),
 ('nègre'),('nègres'),('youpin'),('youpins'),('youpine'),('youpines'),('feuj'),('feujs'),
 ('chinetoque'),('chinetoc'),('chinetoques'),('bridé de merde'),('sale chinois'),
 ('pédé'),('pédés'),('tapette'),('tapettes'),('gouine'),('gouines'),('travelo'),('travelos'),
 ('sous homme'),('sous hommes'),('race inférieure'),('races inférieures'),
 ('mort aux juifs'),('mort aux arabes'),('mort aux noirs'),('mort aux musulmans'),
 ('mort aux homosexuels'),('mort aux femmes'),('mort aux étrangers'),
 ('tous les juifs doivent mourir'),('tous les noirs doivent mourir'),
 ('tous les arabes doivent mourir'),('exterminer les juifs'),('exterminer les noirs'),
 ('exterminer les arabes'),('exterminer les musulmans'),('exterminer les homosexuels'),
 ('génocide des juifs'),('génocide des musulmans'),('suicide collectif'),
 ('pornographie infantile'),('contenu pédopornographique'),('appel au meurtre'),
 ('viol collectif'),('viol sexuel'),('extermination raciale'),('suprématie blanche'),
 ('heil hitler'),('sieg heil'),('white power'),('kill all jews'),('kill all muslims'),
 ('kill all blacks'),('kill all gays'),('go kill yourself'),('kys'),
 ('sale pute'),('sale salope'),('sale chienne'),('fils de pute'),('fille de pute'),
 ('pute de service'),('espèce de pute'),('sale bâtard'),('sale batard'),
 ('sale ordure'),('sale vermine'),('sale parasite'),('crève sale'),('va crever'),
 ('je vais te tuer'),('je vais vous tuer'),('je vais te violer'),('je vais vous violer'),
 ('tu mérites de mourir'),('tu devrais mourir'),('va te suicider'),('suicide toi')
on conflict(term) do nothing;

-- Normalisation des accents, espaces et ponctuations; détection de mots entiers.
create or replace function public.novelya_normalize_moderation(input text) returns text
language sql immutable set search_path='' as $$
 select trim(regexp_replace(translate(lower(coalesce(input,'')),
 'àâäáãåçèéêëìíîïñòóôöõùúûüýÿœæ',
 'aaaaaaceeeeiiiinooooouuuuyyoa'), '[^a-z0-9]+',' ','g'));
$$;
create or replace function public.novelya_blacklist_hits(content text) returns text[]
language sql stable security definer set search_path='' as $$
 select coalesce(array_agg(b.term order by b.term),array[]::text[])
 from public.novelya_blacklist b
 where (' '||public.novelya_normalize_moderation(content)||' ') like
       ('% '||public.novelya_normalize_moderation(b.term)||' %');
$$;
revoke all on function public.novelya_blacklist_hits(text) from public,anon,authenticated;

create or replace function public.novelya_text_suspect(content text) returns boolean
language sql stable security definer set search_path='' as $$
 select cardinality(public.novelya_blacklist_hits(content))>0
 or coalesce(content,'') ~* '(pornograph|viol sexuel|extermination|suicide collectif|appel au meurtre|haine raciale|pédopornograph)';
$$;
revoke all on function public.novelya_text_suspect(text) from public,anon;
grant execute on function public.novelya_text_suspect(text) to authenticated;

-- Bloquer aussi les changements directs en SQL/API, sans dépendre du navigateur.
create or replace function public.novelya_guard_story() returns trigger
language plpgsql security definer set search_path='' as $$
declare hits text[]; chapter_text text;
begin
 if public.is_encria_admin() then return new; end if;
 select string_agg(c.title||' '||c.body,' ') into chapter_text from public.chapters c where c.story_id=new.id;
 hits:=public.novelya_blacklist_hits(new.title||' '||new.description||' '||coalesce(chapter_text,''));
 if cardinality(hits)>0 or public.novelya_text_suspect(new.title||' '||new.description||' '||coalesce(chapter_text,'')) then
  new.visibility:='pending';
  new.moderation_flags:='Alerte blacklist : '||left(array_to_string(hits,', '),450);
 end if;
 return new;
end;$$;
drop trigger if exists novelya_story_blacklist_guard on public.stories;
create trigger novelya_story_blacklist_guard before insert or update of title,description,visibility on public.stories
for each row execute function public.novelya_guard_story();

create or replace function public.novelya_guard_chapter() returns trigger
language plpgsql security definer set search_path='' as $$
declare hits text[];
begin
 if public.is_encria_admin() then return new; end if;
 hits:=public.novelya_blacklist_hits(new.title||' '||new.body);
 if cardinality(hits)>0 or public.novelya_text_suspect(new.title||' '||new.body) then
  update public.stories set visibility='pending',moderation_flags='Alerte blacklist (chapitre) : '||left(array_to_string(hits,', '),450) where id=new.story_id;
 end if;
 return new;
end;$$;
drop trigger if exists novelya_chapter_blacklist_guard on public.chapters;
create trigger novelya_chapter_blacklist_guard after insert or update of title,body on public.chapters
for each row execute function public.novelya_guard_chapter();

-- Supprimer un compte dans Auth et ses données : propriétaire du site ou compte lui-même.
-- Les admins ne peuvent pas supprimer le compte propriétaire. Un admin ne peut pas supprimer un autre admin.
create or replace function public.novelya_delete_account(target_user uuid) returns void
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
 if actor is null or target_user is null then raise exception 'Connexion obligatoire'; end if;
 if exists(select 1 from public.site_owner where user_id=target_user) then raise exception 'Le compte propriétaire ne peut pas être supprimé ici'; end if;
 if actor<>target_user and not exists(select 1 from public.site_owner where user_id=actor) then raise exception 'Seul le propriétaire peut supprimer un autre compte'; end if;
 if exists(select 1 from public.admins where user_id=target_user) then raise exception 'Retirer les droits administrateur avant la suppression'; end if;
 if not exists(select 1 from auth.users where id=target_user) then raise exception 'Compte introuvable'; end if;
 -- Retirer les histoires de l'auteur et les données liées en cascade.
 delete from public.stories where owner_id=target_user;
 -- L'historique d'audit référence aussi auth.users sans ON DELETE CASCADE.
 delete from public.admin_role_audit where actor_id=target_user or target_id=target_user;
 delete from public.moderation_log where admin_id=target_user;
 delete from auth.users where id=target_user;
end;$$;
revoke all on function public.novelya_delete_account(uuid) from public,anon;
grant execute on function public.novelya_delete_account(uuid) to authenticated;

-- Recontrôle immédiat des histoires existantes non administrées, sans publier de contenu.
update public.stories s set visibility='pending',moderation_flags='Alerte blacklist : contenu existant à vérifier'
where s.visibility in ('published','scheduled') and
 (public.novelya_text_suspect(s.title||' '||s.description)
 or exists(select 1 from public.chapters c where c.story_id=s.id and public.novelya_text_suspect(c.title||' '||c.body)));
